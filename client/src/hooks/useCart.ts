import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { useAuthStore } from '../store/authStore';
import type { ApiResponse, Cart } from '../types';

export function useCart() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Cart>>('/cart');
      return data.data;
    },
    enabled: isAuthenticated,
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { productId: string; quantity: number }) => {
      const { data } = await apiClient.post<ApiResponse<Cart>>('/cart/items', payload);
      return data.data;
    },
    onSuccess: (cart) => {
      qc.setQueryData(['cart'], cart);
    },
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const { data } = await apiClient.patch<ApiResponse<Cart>>(`/cart/items/${id}`, { quantity });
      return data.data;
    },
    onSuccess: (cart) => {
      qc.setQueryData(['cart'], cart);
    },
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<ApiResponse<Cart>>(`/cart/items/${id}`);
      return data.data;
    },
    onSuccess: (cart) => {
      qc.setQueryData(['cart'], cart);
    },
  });
}
