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
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as UserRecord;
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

