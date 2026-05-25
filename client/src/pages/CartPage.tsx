import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '../hooks/useCart';
import { CartItem } from '../components/cart/CartItem';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { createCheckoutSession } from '../api/checkout.api';
import { fetchAddresses, fetchShippingRates, type ShippingRate } from '../api/shipping.api';
import { fetchLoyaltyBalance } from '../api/loyalty.api';
import { validateGiftCard } from '../api/giftcards.api';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';
import type { ApiResponse } from '../types';

interface DiscountResult {
  code: string;
  type: string;
  value: number;
  discountOre: number;
}

function formatPrice(ore: number) {
  return `${Math.round(ore / 100)} kr`;
}

export default function CartPage() {
  const { data: cart, isLoading } = useCart();
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discountLoading, setDiscountLoading] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountResult | null>(null);
  const [selectedRateId, setSelectedRateId] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [giftCardCode, setGiftCardCode] = useState('');
  const [giftCardLoading, setGiftCardLoading] = useState(false);
  const [appliedGiftCard, setAppliedGiftCard] = useState<{ code: string; availableOre: number } | null>(null);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  async function handleApplyDiscount() {
    if (!discountCode.trim()) return;
    setDiscountLoading(true);
    try {
      const { data } = await apiClient.post<ApiResponse<DiscountResult>>('/discounts/validate', {
        code: discountCode.trim(),
        orderTotalOre: totalOre,
      });
      setAppliedDiscount(data.data);
      toast.success(`Discount applied: -${formatPrice(data.data.discountOre)}`);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Invalid discount code';
      toast.error(message);
      setAppliedDiscount(null);
    } finally {
      setDiscountLoading(false);
    }
  }

  async function handleApplyGiftCard() {
    if (!giftCardCode.trim()) return;
    setGiftCardLoading(true);
    try {
      const result = await validateGiftCard(giftCardCode.trim().toUpperCase());
      setAppliedGiftCard(result);
      toast.success(`Gift card applied: up to ${formatPrice(result.availableOre)} off`);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Invalid gift card';
      toast.error(message);
      setAppliedGiftCard(null);
    } finally {
      setGiftCardLoading(false);
    }
  }

  async function handleCheckout() {
    if (!selectedAddress) {
      toast.error('Add a shipping address before checkout');
      navigate('/profile');
      return;
    }

    setCheckingOut(true);
    try {
      const url = await createCheckoutSession(
        appliedDiscount?.code,
        selectedRate?.id,
        redeemPoints > 0 ? redeemPoints : undefined,
        appliedGiftCard?.code,
        selectedAddress.id
      );
      window.location.href = url;
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Checkout failed';
      toast.error(message);
      // Fall back to orders page if Stripe isn't configured (dev mode)
      if (message.includes('not configured')) navigate('/orders');
    } finally {
      setCheckingOut(false);
    }
  }

  const items = cart?.items ?? [];
  const subtotalOre = items.reduce((sum, item) => sum + (item.variant?.priceOre ?? item.product.priceOre) * item.quantity, 0);
  const discountOre = appliedDiscount?.discountOre ?? 0;

  const { data: shippingRates = [] } = useQuery({
    queryKey: ['shipping-rates', subtotalOre],
    queryFn: () => fetchShippingRates(subtotalOre),
    enabled: items.length > 0,
  });

  const { data: loyaltyData } = useQuery({
    queryKey: ['loyalty'],
    queryFn: fetchLoyaltyBalance,
    enabled: isAuthenticated && items.length > 0,
  });

  const { data: addresses = [] } = useQuery({
    queryKey: ['addresses'],
    queryFn: fetchAddresses,
    enabled: isAuthenticated && items.length > 0,
  });

  const selectedRate = shippingRates.find((r: ShippingRate) => r.id === selectedRateId) ?? shippingRates[0] ?? null;
  const selectedAddress = addresses.find((addr) => addr.id === selectedAddressId) ?? addresses.find((addr) => addr.isDefault) ?? addresses[0] ?? null;
  const shippingOre = selectedRate?.effectivePriceOre ?? 0;
  const loyaltyDiscountOre = redeemPoints >= 100 ? Math.floor(redeemPoints / 100) * 1000 : 0;
  const giftCardDiscountOre = appliedGiftCard ? Math.min(appliedGiftCard.availableOre, subtotalOre - discountOre - loyaltyDiscountOre + shippingOre) : 0;
  const totalOre = Math.max(0, subtotalOre - discountOre - loyaltyDiscountOre - giftCardDiscountOre + shippingOre);
  const pointsEarned = Math.floor(totalOre / 1000);

  if (isLoading) {
    return (
      <div className="container-page py-16">
        <div className="h-8 bg-stone-200 animate-pulse rounded w-32 mb-8" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 bg-stone-200 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-24 text-center">
        <p className="font-serif text-3xl text-stone-400 mb-3">Your cart is empty</p>
        <p className="text-stone-500 mb-8">Looks like you haven't added anything yet.</p>
        <Link to="/products" className="btn-primary inline-flex">
          Browse coffee
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-900 mb-8 sm:mb-10">Your cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div>
          <div className="card p-6 sticky top-24">
            <h2 className="font-semibold text-stone-900 text-lg mb-5">Order summary</h2>

            <div className="space-y-3 mb-5">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-stone-600 truncate max-w-[160px]">
                    {item.product.name} ×{item.quantity}
                  </span>
                  <span className="text-stone-900 font-medium">
                    {formatPrice((item.variant?.priceOre ?? item.product.priceOre) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Shipping selector */}
            {shippingRates.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-stone-700 mb-2">Shipping</p>
                <div className="space-y-2">
                  {shippingRates.map((rate: ShippingRate) => (
                    <label key={rate.id} className="flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors border-stone-200 hover:border-espresso-400">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="shipping"
                          value={rate.id}
                          checked={(selectedRateId ?? shippingRates[0]?.id) === rate.id}
                          onChange={() => setSelectedRateId(rate.id)}
                          className="accent-espresso-700"
                        />
                        <div>
                          <p className="text-sm font-medium text-stone-900">{rate.name}</p>
                          {rate.estimatedDays && <p className="text-xs text-stone-500">{rate.estimatedDays}</p>}
                        </div>
                      </div>
                      <span className="text-sm font-medium text-stone-900">
                        {rate.isFree ? <span className="text-green-700">Free</span> : formatPrice(rate.priceOre)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Shipping address selector */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-stone-700">Ship to</p>
                <Link to="/profile" className="text-xs text-espresso-700 hover:text-espresso-900">
                  Manage
                </Link>
              </div>
              {addresses.length > 0 ? (
                <div className="space-y-2">
                  {addresses.map((address) => (
                    <label key={address.id} className="flex items-start gap-2 p-3 rounded-lg border border-stone-200 cursor-pointer hover:border-espresso-400">
                      <input
                        type="radio"
                        name="shipping-address"
                        value={address.id}
                        checked={selectedAddress?.id === address.id}
                        onChange={() => setSelectedAddressId(address.id)}
                        className="accent-espresso-700 mt-1"
                      />
                      <span className="text-sm text-stone-600">
                        <span className="block font-medium text-stone-900">{address.name}</span>
                        <span>{address.line1}, {address.postalCode} {address.city}</span>
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <Link to="/profile" className="block p-3 rounded-lg border border-dashed border-stone-300 text-sm text-stone-500 hover:border-espresso-400 hover:text-stone-700">
                  Add a shipping address
                </Link>
              )}
            </div>

            {/* Discount code input */}
            <div className="mb-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={discountCode}
                  onChange={(e) => {
                    setDiscountCode(e.target.value.toUpperCase());
                    if (appliedDiscount) setAppliedDiscount(null);
                  }}
                  placeholder="Discount code"
                  className="text-sm"
                />
                <Button
                  onClick={handleApplyDiscount}
                  loading={discountLoading}
                  size="sm"
                  variant="secondary"
                  className="flex-shrink-0"
                >
                  Apply
                </Button>
              </div>
              {appliedDiscount && (
                <p className="text-xs text-green-700 mt-1.5">
                  Code <strong>{appliedDiscount.code}</strong> applied — saving {formatPrice(appliedDiscount.discountOre)}
                </p>
              )}
            </div>

            {/* Gift card input */}
            <div className="mb-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={giftCardCode}
                  onChange={(e) => {
                    setGiftCardCode(e.target.value.toUpperCase());
                    if (appliedGiftCard) setAppliedGiftCard(null);
                  }}
                  placeholder="Gift card code"
                  className="text-sm"
                />
                <Button
                  onClick={handleApplyGiftCard}
                  loading={giftCardLoading}
                  size="sm"
                  variant="secondary"
                  className="flex-shrink-0"
                >
                  Apply
                </Button>
              </div>
              {appliedGiftCard && (
                <p className="text-xs text-green-700 mt-1.5">
                  Gift card <strong>{appliedGiftCard.code}</strong> applied — up to {formatPrice(appliedGiftCard.availableOre)} off
                </p>
              )}
            </div>

            {/* Loyalty points */}
            {loyaltyData && loyaltyData.points >= 100 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-stone-700">Loyalty points ({loyaltyData.points} pts)</p>
                  {loyaltyDiscountOre > 0 && (
                    <span className="text-xs text-green-700 font-medium">-{formatPrice(loyaltyDiscountOre)}</span>
                  )}
                </div>
                <input
                  type="range"
                  min={0}
                  max={Math.min(loyaltyData.points, Math.floor(loyaltyData.points / 100) * 100)}
                  step={100}
                  value={redeemPoints}
                  onChange={(e) => setRedeemPoints(Number(e.target.value))}
                  className="w-full accent-espresso-700"
                />
                <p className="text-xs text-stone-500 mt-1">
                  {redeemPoints > 0 ? `Redeeming ${redeemPoints} pts for -${formatPrice(loyaltyDiscountOre)}` : 'Slide to redeem points'}
                </p>
              </div>
            )}

            <div className="border-t border-stone-200 pt-4 mb-6 space-y-2">
              {discountOre > 0 && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-600">Subtotal</span>
                    <span className="text-stone-900">{formatPrice(subtotalOre)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-green-700">
                    <span>Discount ({appliedDiscount?.code})</span>
                    <span>−{formatPrice(discountOre)}</span>
                  </div>
                </>
              )}
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-900">Total</span>
                <span className="font-serif text-xl font-semibold text-espresso-800">
                  {formatPrice(totalOre)}
                </span>
              </div>
              {shippingOre > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-600">Shipping ({selectedRate?.name})</span>
                  <span className="text-stone-900">{formatPrice(shippingOre)}</span>
                </div>
              )}
              {selectedRate?.freeThresholdOre && subtotalOre < selectedRate.freeThresholdOre && (
                <p className="text-xs text-stone-500">
                  Add {formatPrice(selectedRate.freeThresholdOre - subtotalOre)} more for free standard shipping
                </p>
              )}
            </div>

            <Button
              onClick={handleCheckout}
              loading={checkingOut}
              size="lg"
              className="w-full"
            >
              Proceed to checkout
            </Button>

            {pointsEarned > 0 && (
              <p className="text-xs text-stone-500 text-center mt-2">
                You'll earn <strong>{pointsEarned} loyalty points</strong> with this order
              </p>
            )}

            <Link to="/products" className="block text-center text-sm text-stone-500 hover:text-stone-700 mt-4 transition-colors">
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
