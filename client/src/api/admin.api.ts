import apiClient from './client';
import type { ApiResponse, Product, Order } from '../types';

export interface AdminStats {
  totalOrders: number;
  totalRevenueOre: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: Array<Order & { user: { name: string; email: string } }>;
  ordersByStatus: Array<{ status: string; _count: { id: number } }>;
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const { data } = await apiClient.get<ApiResponse<AdminStats>>('/admin/stats');
  return data.data;
}

export async function fetchAdminProducts(): Promise<Product[]> {
  const { data } = await apiClient.get<ApiResponse<Product[]>>('/admin/products');
  return data.data;
}

export async function createProduct(payload: Partial<Product>): Promise<Product> {
  const { data } = await apiClient.post<ApiResponse<Product>>('/admin/products', payload);
  return data.data;
}

export async function updateProduct(id: string, payload: Partial<Product>): Promise<Product> {
  const { data } = await apiClient.patch<ApiResponse<Product>>(`/admin/products/${id}`, payload);
  return data.data;
}

export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/admin/products/${id}`);
}

export interface AdminOrder extends Order {
  user: { id: string; email: string; name: string };
}

export async function fetchAdminOrders(): Promise<AdminOrder[]> {
  const { data } = await apiClient.get<ApiResponse<AdminOrder[]>>('/admin/orders');
  return data.data;
}

export async function updateOrderStatus(id: string, status: string): Promise<AdminOrder> {
  const { data } = await apiClient.patch<ApiResponse<AdminOrder>>(`/admin/orders/${id}/status`, { status });
  return data.data;
}

export interface AdminCustomer {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  orderCount: number;
  totalSpendOre: number;
}

export async function fetchAdminCustomers(): Promise<AdminCustomer[]> {
  const { data } = await apiClient.get<ApiResponse<AdminCustomer[]>>('/admin/customers');
  return data.data;
}

export interface DiscountCode {
  id: string;
  code: string;
  type: string;
  value: number;
  minOrderOre: number | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export async function fetchAdminDiscounts(): Promise<DiscountCode[]> {
  const { data } = await apiClient.get<ApiResponse<DiscountCode[]>>('/admin/discounts');
  return data.data;
}

export async function createAdminDiscount(payload: {
  code: string; type: string; value: number;
  minOrderOre?: number; maxUses?: number; expiresAt?: string;
}): Promise<DiscountCode> {
  const { data } = await apiClient.post<ApiResponse<DiscountCode>>('/admin/discounts', payload);
  return data.data;
}

export async function deleteAdminDiscount(id: string): Promise<void> {
  await apiClient.delete(`/admin/discounts/${id}`);
}
