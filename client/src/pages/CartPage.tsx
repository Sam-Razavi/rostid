import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useCart } from '../hooks/useCart';
import { CartItem } from '../components/cart/CartItem';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { createCheckoutSession } from '../api/checkout.api';
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

  async function handleCheckout() {
    setCheckingOut(true);
    try {
      const url = await createCheckoutSession(appliedDiscount?.code);
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

  const items = cart?.items ?? [];
  const subtotalOre = items.reduce((sum, item) => sum + item.product.priceOre * item.quantity, 0);
  const discountOre = appliedDiscount?.discountOre ?? 0;
  const totalOre = Math.max(0, subtotalOre - discountOre);

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
                    {formatPrice(item.product.priceOre * item.quantity)}
                  </span>
                </div>
              ))}
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
              <p className="text-xs text-stone-500">Free shipping on orders over 400 kr</p>
            </div>

            <Button
              onClick={handleCheckout}
              loading={checkingOut}
              size="lg"
              className="w-full"
            >
              Proceed to checkout
            </Button>

            <Link to="/products" className="block text-center text-sm text-stone-500 hover:text-stone-700 mt-4 transition-colors">
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
