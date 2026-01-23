import { useMutation } from '@tanstack/react-query';
import apiClient from '../api/client';
import { useAuthStore } from '../store/authStore';
import type { ApiResponse, User } from '../types';

interface AuthResponse {
  user: User;
  accessToken: string;
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
      return data.data;
    },
    onSuccess: ({ user, accessToken }) => {
      setAuth(user, accessToken);
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: async (payload: { email: string; password: string; name: string }) => {
      const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', payload);
      return data.data;
    },
    onSuccess: ({ user, accessToken }) => {
      setAuth(user, accessToken);
    },
  });
}
