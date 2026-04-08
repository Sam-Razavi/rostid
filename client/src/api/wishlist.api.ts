import apiClient from './client';
import type { ApiResponse } from '../types';

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    priceOre: number;
    imageUrl: string | null;
    stock: number;
    isActive: boolean;
  };
}

export async function fetchWishlist(): Promise<WishlistItem[]> {
  const { data } = await apiClient.get<ApiResponse<WishlistItem[]>>('/wishlist');
  return data.data;
}

export async function addToWishlist(productId: string): Promise<WishlistItem> {
  const { data } = await apiClient.post<ApiResponse<WishlistItem>>('/wishlist', { productId });
  return data.data;
}

export async function removeFromWishlist(productId: string): Promise<void> {
  await apiClient.delete(`/wishlist/${productId}`);
}
