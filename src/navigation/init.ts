import { getCurrentUser } from '../auth/storage';

// Simple helper to fetch initial user without pulling in React/JSX code.
export async function getInitialUser() {
  return await getCurrentUser();
}
