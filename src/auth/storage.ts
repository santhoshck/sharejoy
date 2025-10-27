import * as SecureStore from 'expo-secure-store';

export type UserRecord = { username: string; salt: string; hash: string };

const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';

export async function getUsers(): Promise<Record<string, UserRecord>> {
  try {
    const raw = await SecureStore.getItemAsync(USERS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, UserRecord>;
  } catch (e) {
    console.warn('getUsers error', e);
    return {};
  }
}

export async function saveUsers(users: Record<string, UserRecord>): Promise<void> {
  await SecureStore.setItemAsync(USERS_KEY, JSON.stringify(users));
}

export async function addUser(user: UserRecord): Promise<void> {
  const users = await getUsers();
  users[user.username] = user;
  await saveUsers(users);
}

export async function getUser(username: string): Promise<UserRecord | null> {
  const users = await getUsers();
  return users[username] ?? null;
}

export async function setCurrentUser(username: string): Promise<void> {
  await SecureStore.setItemAsync(CURRENT_USER_KEY, username);
}

export async function getCurrentUser(): Promise<string | null> {
  return SecureStore.getItemAsync(CURRENT_USER_KEY);
}

export async function removeCurrentUser(): Promise<void> {
  await SecureStore.deleteItemAsync(CURRENT_USER_KEY);
}
