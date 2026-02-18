import apiClient from './client';
import type { ApiResponse, ReviewsData, Review } from '../types';

export async function fetchReviews(slug: string): Promise<ReviewsData> {
  const { data } = await apiClient.get<ApiResponse<ReviewsData>>(`/products/${slug}/reviews`);
  return data.data;
}

export async function createReview(slug: string, rating: number, body?: string): Promise<Review> {
  const { data } = await apiClient.post<ApiResponse<Review>>(`/products/${slug}/reviews`, { rating, body });
  return data.data;
}
