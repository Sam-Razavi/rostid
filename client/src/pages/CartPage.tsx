import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { useCart } from '../hooks/useCart';
import { CartItem } from '../components/cart/CartItem';
import { Button } from '../components/ui/Button';
import { placeOrder } from '../api/orders.api';

function formatPrice(ore: number) {
  return `${Math.round(ore / 100)} kr`;
}

export default function CartPage() {
  const { data: cart, isLoading } = useCart();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const checkout = useMutation({
    mutationFn: placeOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Order placed! Thank you.');
      navigate('/orders');
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Something went wrong';
      toast.error(message);
    },
  });

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
  const totalOre = items.reduce((sum, item) => sum + item.product.priceOre * item.quantity, 0);

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
      <h1 className="font-serif text-4xl font-semibold text-stone-900 mb-10">Your cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
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

            <div className="border-t border-stone-200 pt-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-900">Total</span>
                <span className="font-serif text-xl font-semibold text-espresso-800">
                  {formatPrice(totalOre)}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">Free shipping on orders over 400 kr</p>
            </div>

            <Button
              onClick={() => checkout.mutate()}
              loading={checkout.isPending}
              size="lg"
              className="w-full"
            >
              Place order
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
