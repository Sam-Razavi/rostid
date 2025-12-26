import apiClient from './client';
import type { ApiResponse } from '../types';

export interface LoyaltyTransaction {
  id: string;
  accountId: string;
  orderId: string | null;
  delta: number;
  reason: string;
  createdAt: string;
}

export interface LoyaltyBalance {
  points: number;
  lifetimeEarned: number;
  transactions: LoyaltyTransaction[];
}

export async function fetchLoyaltyBalance(): Promise<LoyaltyBalance> {
  const { data } = await apiClient.get<ApiResponse<LoyaltyBalance>>('/loyalty');
  return data.data;
}

export async function fetchRedeemPreview(points: number): Promise<{ points: number; discountOre: number }> {
  const { data } = await apiClient.post<ApiResponse<{ points: number; discountOre: number }>>('/loyalty/redeem-preview', { points });
  return data.data;
}
