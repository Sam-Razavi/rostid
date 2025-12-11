import apiClient from './client';

export async function createCheckoutSession(discountCode?: string, shippingRateId?: string): Promise<string> {
  const { data } = await apiClient.post<{ data: { url: string } }>('/checkout/session', {
    discountCode: discountCode ?? null,
    shippingRateId: shippingRateId ?? null,
  });
  return data.data.url;
}
