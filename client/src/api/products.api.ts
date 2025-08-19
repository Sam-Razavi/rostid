import apiClient from './client';
import type { ApiResponse, Product, ProductsResponse, Category } from '../types';

export interface ProductsQuery {
  category?: string;
  roast?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sort?: string;
  exclude?: string;
  inStock?: boolean;
}

export async function fetchProducts(query: ProductsQuery = {}): Promise<ProductsResponse> {
  const params = Object.fromEntries(
    Object.entries(query).filter(([, v]) => v !== undefined && v !== '')
  );
  const { data } = await apiClient.get<ApiResponse<ProductsResponse>>('/products', { params });
  return data.data;
}

export async function fetchProduct(slug: string): Promise<Product> {
  const { data } = await apiClient.get<ApiResponse<Product>>(`/products/${slug}`);
  return data.data;
}

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<ApiResponse<Category[]>>('/categories');
  return data.data;
}
