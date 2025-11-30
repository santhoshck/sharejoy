import React from 'react';
// react-test-renderer not required for these tests — using direct helpers instead

// We'll mock storage getCurrentUser so root navigator can decide which stack to show
const mockGetCurrentUser = jest.fn();
jest.mock('../src/auth/storage', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
  removeCurrentUser: async () => {},
}));

import { getInitialUser } from '../src/navigation/init';

describe('RootNavigator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getInitialUser returns username when one exists', async () => {
    mockGetCurrentUser.mockResolvedValue('alice');

    const u = await getInitialUser();
    expect(u).toBe('alice');
  });

  it('getInitialUser returns null when no current user', async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const u = await getInitialUser();
    expect(u).toBeNull();
  });
});
