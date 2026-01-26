import apiClient from './client';
import type { ApiResponse, Order } from '../types';

export async function placeOrder(): Promise<Order> {
  const { data } = await apiClient.post<ApiResponse<Order>>('/orders');
  return data.data;
}

export async function fetchOrders(): Promise<Order[]> {
  const { data } = await apiClient.get<ApiResponse<Order[]>>('/orders');
  return data.data;
}

export async function fetchOrder(id: string): Promise<Order> {
  const { data } = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
  return data.data;
}
