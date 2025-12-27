import apiClient from './client';

export async function createCheckoutSession(discountCode?: string, shippingRateId?: string, loyaltyPoints?: number): Promise<string> {
  const { data } = await apiClient.post<{ data: { url: string } }>('/checkout/session', {
    discountCode: discountCode ?? null,
    shippingRateId: shippingRateId ?? null,
    loyaltyPoints: loyaltyPoints ?? null,
  });
  return data.data.url;
}
