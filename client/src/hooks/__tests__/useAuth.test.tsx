import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useLogin, useRegister } from '../useAuth';
import { useAuthStore } from '../../store/authStore';

vi.mock('../../api/client', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    defaults: { baseURL: '' },
  },
}));

import apiClient from '../../api/client';

const mockUser = { id: 'u1', email: 'test@test.com', name: 'Test User', role: 'customer' as const, createdAt: new Date().toISOString() };

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.getState().clearAuth();
});

describe('useLogin', () => {
  it('calls POST /auth/login with credentials', async () => {
    (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { user: mockUser, accessToken: 'tok123' } },
    });

    const { result } = renderHook(() => useLogin(), { wrapper });

    act(() => result.current.mutate({ email: 'test@test.com', password: 'password123' }));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@test.com',
      password: 'password123',
    });
  });

  it('sets auth store on success', async () => {
    (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { user: mockUser, accessToken: 'tok123' } },
    });

    const { result } = renderHook(() => useLogin(), { wrapper });
    act(() => result.current.mutate({ email: 'test@test.com', password: 'password123' }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const { accessToken } = useAuthStore.getState();
    expect(accessToken).toBe('tok123');
  });

  it('surfaces error when API call fails', async () => {
    (apiClient.post as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Invalid credentials'));

    const { result } = renderHook(() => useLogin(), { wrapper });
    act(() => result.current.mutate({ email: 'bad@test.com', password: 'wrong' }));
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeTruthy();
  });
});

describe('useRegister', () => {
  it('calls POST /auth/register with payload', async () => {
    (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { user: mockUser, accessToken: 'tok456' } },
    });

    const { result } = renderHook(() => useRegister(), { wrapper });
    act(() =>
      result.current.mutate({ email: 'new@test.com', password: 'newpassword', name: 'New User' })
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.post).toHaveBeenCalledWith('/auth/register', {
      email: 'new@test.com',
      password: 'newpassword',
      name: 'New User',
    });
  });

  it('sets auth store on successful registration', async () => {
    (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { user: mockUser, accessToken: 'tok456' } },
    });

    const { result } = renderHook(() => useRegister(), { wrapper });
    act(() =>
      result.current.mutate({ email: 'new@test.com', password: 'newpassword', name: 'New User' })
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(useAuthStore.getState().accessToken).toBe('tok456');
  });
});
