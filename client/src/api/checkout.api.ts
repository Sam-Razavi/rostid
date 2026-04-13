import apiClient from './client';

export async function createCheckoutSession(discountCode?: string): Promise<string> {
  const { data } = await apiClient.post<{ data: { url: string } }>('/checkout/session', {
    discountCode: discountCode ?? null,
  });
  return data.data.url;
}
