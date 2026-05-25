import apiClient from './client';

export async function createCheckoutSession(
  discountCode?: string,
  shippingRateId?: string,
  loyaltyPoints?: number,
  giftCardCode?: string,
  shippingAddressId?: string
): Promise<string> {
  const { data } = await apiClient.post<{ data: { url: string } }>('/checkout/session', {
    discountCode: discountCode ?? null,
    shippingRateId: shippingRateId ?? null,
    shippingAddressId: shippingAddressId ?? null,
    loyaltyPoints: loyaltyPoints ?? null,
    giftCardCode: giftCardCode ?? null,
  });
  return data.data.url;
}
