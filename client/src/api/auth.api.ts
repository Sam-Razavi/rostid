import axios from 'axios';
import apiClient from './client';
import type { ApiResponse, User } from '../types';

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', { email, password });
  return data.data;
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', { name, email, password });
  return data.data;
}

export async function refreshSession(): Promise<string | null> {
  try {
    const { data } = await axios.post<ApiResponse<{ accessToken: string }>>(
      '/api/auth/refresh',
      {},
      { withCredentials: true }
    );
    return data.data.accessToken;
  } catch {
    return null;
  }
}

export async function fetchMe(accessToken: string): Promise<User | null> {
  try {
    const { data } = await axios.get<ApiResponse<{ user: User }>>('/api/auth/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true,
    });
    return data.data.user;
  } catch {
    return null;
  }
}
