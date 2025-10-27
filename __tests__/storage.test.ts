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
});
