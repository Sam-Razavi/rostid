import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
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
    mutationFn: async (payload: { productId: string; quantity: number; variantId?: string }) => {
      const { data } = await apiClient.post<ApiResponse<Cart>>('/cart/items', payload);
      return data.data;
    },
    onSuccess: (cart) => {
      qc.setQueryData(['cart'], cart);
      toast.success('Added to cart');
    },
    onError: () => {
      toast.error('Could not add to cart');
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
    onMutate: async ({ id, quantity }) => {
      await qc.cancelQueries({ queryKey: ['cart'] });
      const snapshot = qc.getQueryData<Cart>(['cart']);

      qc.setQueryData<Cart>(['cart'], (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item) => (item.id === id ? { ...item, quantity } : item)),
        };
      });

      return { snapshot };
    },
    onError: (_err, _vars, context) => {
      if (context?.snapshot) {
        qc.setQueryData(['cart'], context.snapshot);
      }
      toast.error('Could not update quantity');
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['cart'] });
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
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['cart'] });
      const snapshot = qc.getQueryData<Cart>(['cart']);

      qc.setQueryData<Cart>(['cart'], (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.filter((item) => item.id !== id),
        };
      });

      return { snapshot };
    },
    onError: (_err, _vars, context) => {
      if (context?.snapshot) {
        qc.setQueryData(['cart'], context.snapshot);
      }
      toast.error('Could not remove item');
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['cart'] });
    },
    onSuccess: () => {
      toast.success('Item removed');
    },
  });
}
