import apiClient from './client';
import type { ApiResponse, Product, Order, ProductVariant } from '../types';

export interface AdminStats {
  totalOrders: number;
  totalRevenueOre: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: Array<Order & { user: { name: string; email: string } }>;
  ordersByStatus: Array<{ status: string; _count: { id: number } }>;
  revenueByProduct: Array<{ name: string; revenueOre: number }>;
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
  shippingAddress?: {
    id: string;
    name: string;
    line1: string;
    line2: string | null;
    city: string;
    postalCode: string;
    country: string;
  } | null;
  returns?: AdminReturn[];
}

export async function fetchAdminOrders(): Promise<AdminOrder[]> {
  const { data } = await apiClient.get<ApiResponse<AdminOrder[]>>('/admin/orders');
  return data.data;
}

export async function fetchAdminOrder(id: string): Promise<AdminOrder> {
  const { data } = await apiClient.get<ApiResponse<AdminOrder>>(`/admin/orders/${id}`);
  return data.data;
}

export async function updateOrderStatus(
  id: string,
  status: string,
  extras?: { trackingNumber?: string | null; carrier?: string | null }
): Promise<AdminOrder> {
  const { data } = await apiClient.patch<ApiResponse<AdminOrder>>(`/admin/orders/${id}/status`, { status, ...extras });
  return data.data;
}

export interface AdminReturn {
  id: string;
  orderId: string;
  userId: string;
  reason: string;
  status: string;
  refundOre: number | null;
  stripeRefundId: string | null;
  createdAt: string;
  items: Array<{ id: string; orderItemId: string; quantity: number }>;
  order?: AdminOrder;
}

export async function fetchAdminReturns(): Promise<AdminReturn[]> {
  const { data } = await apiClient.get<ApiResponse<AdminReturn[]>>('/admin/returns');
  return data.data;
}

export async function updateAdminReturn(
  id: string,
  payload: { status: 'approved' | 'rejected' | 'refunded'; refundOre?: number }
): Promise<AdminReturn> {
  const { data } = await apiClient.patch<ApiResponse<AdminReturn>>(`/admin/returns/${id}`, payload);
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

export async function fetchAdminVariants(productId: string): Promise<ProductVariant[]> {
  const { data } = await apiClient.get<ApiResponse<ProductVariant[]>>(`/admin/products/${productId}/variants`);
  return data.data;
}

export async function createAdminVariant(productId: string, payload: Partial<ProductVariant>): Promise<ProductVariant> {
  const { data } = await apiClient.post<ApiResponse<ProductVariant>>(`/admin/products/${productId}/variants`, payload);
  return data.data;
}

export async function updateAdminVariant(productId: string, variantId: string, payload: Partial<ProductVariant>): Promise<ProductVariant> {
  const { data } = await apiClient.patch<ApiResponse<ProductVariant>>(`/admin/products/${productId}/variants/${variantId}`, payload);
  return data.data;
}

export async function deleteAdminVariant(productId: string, variantId: string): Promise<void> {
  await apiClient.delete(`/admin/products/${productId}/variants/${variantId}`);
}
