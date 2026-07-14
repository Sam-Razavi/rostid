import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (axios.isCancel(error)) return Promise.reject(error);

    if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
      const networkError = new Error('Network error. Please check your connection.');
      (networkError as unknown as { response: unknown }).response = {
        data: { message: 'Network error. Please check your connection.' },
      };
      return Promise.reject(networkError);
    }

    if (error.response?.status !== 401 || original._retried) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        pendingRequests.push((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(original));
        });
      });
    }

    original._retried = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
      const newToken: string = data.data.accessToken;

      useAuthStore.getState().setAccessToken(newToken);

      pendingRequests.forEach((cb) => cb(newToken));
      pendingRequests = [];

      original.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(original);
    } catch {
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
