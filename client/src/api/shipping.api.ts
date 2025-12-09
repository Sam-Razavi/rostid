import apiClient from './client';
import type { ApiResponse } from '../types';

export interface ShippingAddress {
  id: string;
  userId: string;
  name: string;
  line1: string;
  line2: string | null;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
}

export interface ShippingRate {
  id: string;
  name: string;
  priceOre: number;
  effectivePriceOre: number;
  isFree: boolean;
  freeThresholdOre: number | null;
  estimatedDays: string | null;
}

export async function fetchShippingRates(totalOre: number): Promise<ShippingRate[]> {
  const { data } = await apiClient.get<ApiResponse<ShippingRate[]>>(`/shipping/rates?totalOre=${totalOre}`);
  return data.data;
}

export async function fetchAddresses(): Promise<ShippingAddress[]> {
  const { data } = await apiClient.get<ApiResponse<ShippingAddress[]>>('/shipping/addresses');
  return data.data;
}

export async function createAddress(payload: Omit<ShippingAddress, 'id' | 'userId' | 'createdAt'>): Promise<ShippingAddress> {
  const { data } = await apiClient.post<ApiResponse<ShippingAddress>>('/shipping/addresses', payload);
  return data.data;
}

export async function updateAddress(id: string, payload: Partial<ShippingAddress>): Promise<ShippingAddress> {
  const { data } = await apiClient.patch<ApiResponse<ShippingAddress>>(`/shipping/addresses/${id}`, payload);
  return data.data;
}

export async function deleteAddress(id: string): Promise<void> {
  await apiClient.delete(`/shipping/addresses/${id}`);
}
