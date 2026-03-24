import apiClient from './client';

export async function createCheckoutSession(): Promise<string> {
  const { data } = await apiClient.post<{ data: { url: string } }>('/checkout/session');
  return data.data.url;
}
