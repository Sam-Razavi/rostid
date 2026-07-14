import apiClient from './client';
import type { ApiResponse } from '../types';

export interface Subscription {
  id: string;
  userId: string;
  productId: string;
  variantId: string | null;
  intervalDays: number;
  status: 'active' | 'paused' | 'cancelled';
  nextBillingDate: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    priceOre: number;
    imageUrl: string | null;
  };
}

export async function fetchSubscriptions(): Promise<Subscription[]> {
  const { data } = await apiClient.get<ApiResponse<Subscription[]>>('/subscriptions');
  return data.data;
}

export async function createSubscription(payload: {
  productId: string;
  intervalDays: number;
  variantId?: string | null;
}): Promise<{ subscription: Subscription; checkoutUrl: string | null }> {
  const { data } = await apiClient.post<
    ApiResponse<{ subscription: Subscription; checkoutUrl: string | null }>
  >('/subscriptions', payload);
  return data.data;
}

export async function updateSubscription(
  id: string,
  payload: { status?: string; intervalDays?: number }
): Promise<Subscription> {
  const { data } = await apiClient.patch<ApiResponse<Subscription>>(
    `/subscriptions/${id}`,
    payload
  );
  return data.data;
}
