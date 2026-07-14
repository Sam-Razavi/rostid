import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchAdminOrder, updateOrderStatus } from '../../api/admin.api';
import { OrderStatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { Skeleton } from '../../components/ui/Skeleton';
import type { OrderStatus } from '../../types';

function formatPrice(ore: number | null | undefined) {
  return `${Math.round((ore ?? 0) / 100)} kr`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('sv-SE', { dateStyle: 'medium', timeStyle: 'short' });
}

const statuses: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [status, setStatus] = useState<OrderStatus>('pending');
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  const {
    data: order,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'orders', id],
    queryFn: async () => {
      const result = await fetchAdminOrder(id!);
      setStatus(result.status);
      setCarrier(result.carrier ?? '');
      setTrackingNumber(result.trackingNumber ?? '');
      return result;
    },
    enabled: !!id,
  });

  const save = useMutation({
    mutationFn: () =>
      updateOrderStatus(id!, status, {
        carrier: carrier || null,
        trackingNumber: trackingNumber || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
      qc.invalidateQueries({ queryKey: ['admin', 'orders', id] });
      toast.success('Order updated');
    },
    onError: () => toast.error('Failed to update order'),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    save.mutate();
  }

  if (isLoading) return <Skeleton className="h-96 rounded-xl" />;
  if (isError || !order) return <ErrorMessage onRetry={refetch} />;

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/admin/orders" className="text-sm text-stone-500 hover:text-stone-900">
          Orders
        </Link>
        <span className="text-stone-300">/</span>
        <span className="font-mono text-sm text-stone-600">
          #{order.id.slice(-8).toUpperCase()}
        </span>
      </div>

      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900 mb-1">Order detail</h1>
          <p className="text-sm text-stone-500">{formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-4">
              Items
            </h2>
            <div className="divide-y divide-stone-100">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-4 gap-4">
                  <div>
                    <p className="font-medium text-stone-900">{item.product.name}</p>
                    {item.variant && (
                      <p className="text-xs text-stone-500">
                        {item.variant.name}{' '}
                        {item.variant.grind ? `- ${item.variant.grind.replace('_', ' ')}` : ''}
                      </p>
                    )}
                    <p className="text-xs text-stone-500">
                      Qty {item.quantity} x {formatPrice(item.unitPriceOre)}
                    </p>
                  </div>
                  <p className="font-medium text-stone-900">
                    {formatPrice(item.unitPriceOre * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-4">
              Payment summary
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">Subtotal</span>
                <span>{formatPrice(order.subtotalOre ?? order.totalOre)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Shipping</span>
                <span>{formatPrice(order.shippingOre)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Discounts</span>
                <span>
                  -
                  {formatPrice(
                    (order.discountOre ?? 0) +
                      (order.loyaltyDiscountOre ?? 0) +
                      (order.giftCardOre ?? 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between border-t border-stone-200 pt-3 font-semibold text-stone-900">
                <span>Total paid</span>
                <span>{formatPrice(order.totalOre)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-4">
              Customer
            </h2>
            <p className="font-medium text-stone-900">{order.user.name}</p>
            <p className="text-sm text-stone-500">{order.user.email}</p>
          </div>

          <div className="card p-6">
            <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-4">
              Shipping address
            </h2>
            {order.shippingAddress ? (
              <div className="text-sm text-stone-600">
                <p className="font-medium text-stone-900">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.line1}</p>
                {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                <p>
                  {order.shippingAddress.postalCode} {order.shippingAddress.city}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            ) : (
              <p className="text-sm text-stone-400">No saved address attached.</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="card p-6">
            <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-4">
              Fulfillment
            </h2>
            <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm mb-4"
            >
              {statuses.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="carrier">
              Carrier
            </label>
            <input
              id="carrier"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm mb-4"
              placeholder="PostNord"
            />

            <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="tracking">
              Tracking number
            </label>
            <input
              id="tracking"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm mb-5"
              placeholder="Tracking ID"
            />

            <Button type="submit" className="w-full" loading={save.isPending}>
              Save order
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
