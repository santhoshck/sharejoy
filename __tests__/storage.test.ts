// Mock expo-secure-store for tests
jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    getItemAsync: async (key: string) => store.get(key) ?? null,
    setItemAsync: async (key: string, value: string) => {
      store.set(key, value);
    },
    deleteItemAsync: async (key: string) => {
      store.delete(key);
    },
  };
});

// Mock crypto helpers to avoid native/random imports during tests
jest.mock('../src/auth/crypto', () => ({
  generateSalt: async () => 'deadbeef',
  hashPassword: (pw: string, salt: string) => `${pw}:${salt}`,
  verifyPassword: (pw: string, salt: string, expected: string) => expected === `${pw}:${salt}`,
}));

import { addUser, getUser, setCurrentUser, getCurrentUser, removeCurrentUser } from '../src/auth/storage';

describe('storage (secure store mocked)', () => {
  it('addUser and getUser work', async () => {
    const user = { username: 'alice', salt: '00', hash: 'aa' };
    await addUser(user);
    const fetched = await getUser('alice');
    expect(fetched).not.toBeNull();
    expect(fetched?.username).toBe('alice');
    expect(fetched?.hash).toBe('aa');
  });

  it('set/get/remove current user', async () => {
    await setCurrentUser('bob');
    const current = await getCurrentUser();
    expect(current).toBe('bob');
    await removeCurrentUser();
    const after = await getCurrentUser();
    expect(after).toBeNull();
  });

  it('changeUserPassword updates the stored hash', async () => {
    const username = 'carol';
    // initial salt and hash using mock hashPassword
    await addUser({ username, salt: 's0', hash: 'old:s0' });
    // change password (mock generateSalt returns 'deadbeef')
    const { changeUserPassword, getUser } = require('../src/auth/storage');
    await changeUserPassword(username, 'old', 'new');
    const u = await getUser(username);
    expect(u).not.toBeNull();
    // mock hashPassword produces `${pw}:${salt}` so expect 'new:deadbeef'
    expect(u?.hash).toBe('new:deadbeef');
  });

  it('deleteUser removes the user and clears current if needed', async () => {
    const username = 'dave';
    await addUser({ username, salt: 's1', hash: 'x:s1' });
    await setCurrentUser(username);
    const { deleteUser, getUser, getCurrentUser } = require('../src/auth/storage');
    await deleteUser(username);
    const u = await getUser(username);
    expect(u).toBeNull();
    const current = await getCurrentUser();
    expect(current).toBeNull();
  });
});
