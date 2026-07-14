import apiClient from './client';
import type { ApiResponse } from '../types';

export async function validateGiftCard(
  code: string
): Promise<{ code: string; availableOre: number }> {
  const { data } = await apiClient.post<ApiResponse<{ code: string; availableOre: number }>>(
    '/giftcards/validate',
    { code }
  );
  return data.data;
}
