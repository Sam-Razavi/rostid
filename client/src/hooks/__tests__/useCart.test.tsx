import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useAddToCart, useRemoveCartItem, useUpdateCartItem } from '../useCart';

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('../../api/client', () => ({
  default: {
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    defaults: { baseURL: '' },
  },
}));

vi.mock('../../store/authStore', () => ({
  useAuthStore: vi.fn((selector: (s: { isAuthenticated: boolean }) => unknown) =>
    selector({ isAuthenticated: true })
  ),
}));

import apiClient from '../../api/client';

const mockCart = {
  id: 'cart-1',
  items: [
    {
      id: 'item-1',
      productId: 'p1',
      quantity: 2,
      product: { name: 'Coffee', priceOre: 10000, imageUrl: null, slug: 'coffee' },
      variant: null,
    },
  ],
};

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useAddToCart', () => {
  it('calls POST /cart/items with payload', async () => {
    (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: mockCart },
    });

    const { result } = renderHook(() => useAddToCart(), { wrapper });
    act(() => result.current.mutate({ productId: 'p1', quantity: 1 }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.post).toHaveBeenCalledWith('/cart/items', {
      productId: 'p1',
      quantity: 1,
    });
  });

  it('shows success toast on add', async () => {
    const toast = (await import('react-hot-toast')).default;
    (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: mockCart },
    });

    const { result } = renderHook(() => useAddToCart(), { wrapper });
    act(() => result.current.mutate({ productId: 'p1', quantity: 1 }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(toast.success).toHaveBeenCalledWith('Added to cart');
  });

  it('shows error toast on failure', async () => {
    const toast = (await import('react-hot-toast')).default;
    (apiClient.post as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Stock limit'));

    const { result } = renderHook(() => useAddToCart(), { wrapper });
    act(() => result.current.mutate({ productId: 'p1', quantity: 1 }));
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toast.error).toHaveBeenCalledWith('Could not add to cart');
  });
});

describe('useRemoveCartItem', () => {
  it('calls DELETE /cart/items/:id', async () => {
    (apiClient.delete as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { ...mockCart, items: [] } },
    });

    const { result } = renderHook(() => useRemoveCartItem(), { wrapper });
    act(() => result.current.mutate('item-1'));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.delete).toHaveBeenCalledWith('/cart/items/item-1');
  });

  it('shows success toast when item is removed', async () => {
    const toast = (await import('react-hot-toast')).default;
    (apiClient.delete as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { ...mockCart, items: [] } },
    });

    const { result } = renderHook(() => useRemoveCartItem(), { wrapper });
    act(() => result.current.mutate('item-1'));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(toast.success).toHaveBeenCalledWith('Item removed');
  });

  it('shows error toast when remove fails', async () => {
    const toast = (await import('react-hot-toast')).default;
    (apiClient.delete as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useRemoveCartItem(), { wrapper });
    act(() => result.current.mutate('item-1'));
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toast.error).toHaveBeenCalledWith('Could not remove item');
  });
});

describe('useUpdateCartItem', () => {
  it('calls PATCH /cart/items/:id with quantity', async () => {
    (apiClient.patch as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: mockCart },
    });

    const { result } = renderHook(() => useUpdateCartItem(), { wrapper });
    act(() => result.current.mutate({ id: 'item-1', quantity: 3 }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.patch).toHaveBeenCalledWith('/cart/items/item-1', { quantity: 3 });
  });

  it('shows error toast when update fails', async () => {
    const toast = (await import('react-hot-toast')).default;
    (apiClient.patch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useUpdateCartItem(), { wrapper });
    act(() => result.current.mutate({ id: 'item-1', quantity: 3 }));
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toast.error).toHaveBeenCalledWith('Could not update quantity');
  });
});
