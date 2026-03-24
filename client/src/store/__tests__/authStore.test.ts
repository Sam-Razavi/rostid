import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../authStore';

const mockUser = {
  id: 'user-1',
  email: 'test@test.com',
  name: 'Test User',
  role: 'customer' as const,
  createdAt: new Date().toISOString(),
};

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false });
  });

  it('starts with no auth state', () => {
    const { user, accessToken, isAuthenticated } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(accessToken).toBeNull();
    expect(isAuthenticated).toBe(false);
  });

  it('setAuth sets user and token', () => {
    useAuthStore.getState().setAuth(mockUser, 'token-abc');
    const { user, accessToken, isAuthenticated } = useAuthStore.getState();
    expect(user).toEqual(mockUser);
    expect(accessToken).toBe('token-abc');
    expect(isAuthenticated).toBe(true);
  });

  it('setAccessToken updates only the token', () => {
    useAuthStore.getState().setAuth(mockUser, 'old-token');
    useAuthStore.getState().setAccessToken('new-token');
    const { user, accessToken, isAuthenticated } = useAuthStore.getState();
    expect(user).toEqual(mockUser);
    expect(accessToken).toBe('new-token');
    expect(isAuthenticated).toBe(true);
  });

  it('clearAuth resets all state', () => {
    useAuthStore.getState().setAuth(mockUser, 'token-abc');
    useAuthStore.getState().clearAuth();
    const { user, accessToken, isAuthenticated } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(accessToken).toBeNull();
    expect(isAuthenticated).toBe(false);
  });
});
