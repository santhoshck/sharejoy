import { supabase } from '../lib/supabase';

export type UserRole = 'user' | 'approver';
export type UserRecord = { id: string; username: string; role: UserRole };

export async function getUser(username: string): Promise<UserRecord | null> {
  // We fetch by username from profiles table
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (error || !data) return null;
  return data as UserRecord;
}

export async function getProfileById(id: string): Promise<UserRecord | null> {
  const timeout = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), ms));

  try {
    console.log('[Storage] getProfileById for:', id);

    // Race the supabase query against a 5-second timeout
    const { data, error } = await Promise.race([
      supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single(),
      timeout(5000)
    ]) as any;

    if (error) {
      console.warn('[Storage] getProfileById error:', error.message);
      return null;
    }

    console.log('[Storage] getProfileById success:', data?.username);
    return data as UserRecord;
  } catch (e: any) {
    if (e.message === 'TIMEOUT') {
      console.error('[Storage] getProfileById timed out after 5s');
    } else {
      console.error('[Storage] getProfileById exception:', e);
    }
    return null;
  }
}



export async function getCurrentUser(): Promise<string | null> {
  // Return the username of the currently logged in user
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const profile = await getProfileById(session.user.id);
  return profile?.username || null;
}

export async function getCurrentUserId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user.id || null;
}

export async function removeCurrentUser(): Promise<void> {
  await supabase.auth.signOut();
}

