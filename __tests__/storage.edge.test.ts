// Edge-case tests for storage helpers

// Mock expo-secure-store for tests (isolated map per file)
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

// Mock crypto helpers to keep deterministic behavior
jest.mock('../src/auth/crypto', () => ({
  generateSalt: async () => 'newsalt',
  hashPassword: (pw: string, salt: string) => `${pw}:${salt}`,
  verifyPassword: (pw: string, salt: string, expected: string) => expected === `${pw}:${salt}`,
}));

import { addUser, getUser, setCurrentUser, getCurrentUser, removeCurrentUser, changeUserPassword, deleteUser, updateUser } from '../src/auth/storage';

describe('storage edge cases', () => {
  beforeEach(async () => {
    // Ensure store is empty between tests
    const ss = require('expo-secure-store');
    // Clear by deleting known keys
    await ss.deleteItemAsync('users');
    await ss.deleteItemAsync('currentUser');
  });

  it('changeUserPassword throws when current password is incorrect', async () => {
    await addUser({ username: 'edge1', salt: 's1', hash: 'correct:s1' });
    await expect(changeUserPassword('edge1', 'wrong', 'newpw')).rejects.toThrow('Current password incorrect');
  });

  it('deleteUser does not clear current user when different', async () => {
    await addUser({ username: 'u1', salt: 'x', hash: 'h' });
    await addUser({ username: 'u2', salt: 'y', hash: 'h2' });
    await setCurrentUser('u2');
    await deleteUser('u1');
    const current = await getCurrentUser();
    expect(current).toBe('u2');
    // ensure u1 removed
    const u1 = await getUser('u1');
    expect(u1).toBeNull();
  });

  it('updateUser persists modified fields', async () => {
    await addUser({ username: 'up1', salt: 'a', hash: 'old:a' });
    const before = await getUser('up1');
    expect(before).not.toBeNull();
    // update hash
    await updateUser({ username: 'up1', salt: 'b', hash: 'new:b' });
    const after = await getUser('up1');
    expect(after).not.toBeNull();
    expect(after?.hash).toBe('new:b');
    expect(after?.salt).toBe('b');
  });
});
