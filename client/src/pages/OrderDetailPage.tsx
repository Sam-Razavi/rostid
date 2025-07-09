import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchOrder } from '../api/orders.api';
import apiClient from '../api/client';
import { OrderStatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { OrderCardSkeleton } from '../components/ui/Skeleton';
import { OrderTimeline } from '../components/orders/OrderTimeline';
import type { ApiResponse, Order } from '../types';

function formatPrice(ore: number) {
  return `${Math.round(ore / 100)} kr`;
}

function getTrackingUrl(carrier: string | null | undefined, trackingNumber: string): string | null {
  const c = (carrier ?? '').toLowerCase();
  if (c.includes('postnord') || c.includes('post nord')) return `https://tracking.postnord.com/en/?id=${trackingNumber}`;
  if (c.includes('dhl')) return `https://www.dhl.com/se-en/home/tracking.html?tracking-id=${trackingNumber}`;
  if (c.includes('budbee')) return `https://tracking.budbee.com/?packageId=${trackingNumber}`;
  if (c.includes('gls')) return `https://gls-group.com/track/${trackingNumber}`;
  return null;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showReturn, setShowReturn] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const queryClient = useQueryClient();

  const { data: order, isLoading, isError, refetch } = useQuery({
    queryKey: ['order', id],
    queryFn: () => fetchOrder(id!),
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: () => apiClient.patch<ApiResponse<Order>>(`/orders/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order cancelled');
      setShowConfirm(false);
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to cancel order';
      toast.error(message);
      setShowConfirm(false);
    },
  });

  const returnMutation = useMutation({
    mutationFn: () => apiClient.post(`/orders/${id}/return`, {
      reason: returnReason,
      items: Object.entries(selectedItems)
        .filter(([, qty]) => qty > 0)
        .map(([orderItemId, quantity]) => ({ orderItemId, quantity })),
    }),
    onSuccess: () => {
      toast.success('Return request submitted');
      setShowReturn(false);
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to submit return';
      toast.error(message);
    },
  });

  const canCancel = order && (order.status === 'pending' || order.status === 'confirmed');
  const canReturn = order && order.status === 'delivered';

  if (isLoading) return <div className="container-page py-16"><OrderCardSkeleton /></div>;
  if (isError || !order) return <div className="container-page py-16"><ErrorMessage onRetry={refetch} /></div>;

  return (
    <div className="container-page py-12 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/orders" className="text-stone-500 hover:text-stone-700 transition-colors text-sm">
          ← Orders
        </Link>
        <span className="text-stone-300">/</span>
        <span className="text-stone-700 text-sm font-mono">{order.id.slice(0, 8)}…</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-stone-900 mb-1">Order details</h1>
          <p className="text-stone-500 text-sm">{formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Status timeline */}
      <div className="card p-6 mb-8">
        <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-6">Status</h2>
        <OrderTimeline status={order.status} />
      </div>

      {/* Shipping info */}
      {(order.trackingNumber || order.customerNote) && (
        <div className="card p-6 mb-6">
          {order.trackingNumber && (
            <div className="mb-4 last:mb-0">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Tracking number</p>
              {(() => {
                const url = getTrackingUrl(order.carrier, order.trackingNumber!);
                return url ? (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="font-mono text-espresso-700 hover:text-espresso-900 text-sm underline underline-offset-2">
                    {order.trackingNumber}
                  </a>
                ) : (
                  <p className="font-mono text-stone-900 text-sm">{order.trackingNumber}</p>
                );
              })()}
              {order.carrier && (
                <p className="text-xs text-stone-500 mt-0.5">via {order.carrier}</p>
              )}
            </div>
          )}
          {order.customerNote && (
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Your note</p>
              <p className="text-stone-700 text-sm">{order.customerNote}</p>
            </div>
          )}
        </div>
      )}

      {/* Items */}
      <div className="card p-6 mb-6">
        <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-5">Items</h2>
        <div className="divide-y divide-stone-100">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-4 gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {item.product.imageUrl ? (
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-12 h-12 rounded-lg object-cover bg-stone-100 flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-espresso-50 flex-shrink-0 flex items-center justify-center">
                    <svg className="w-5 h-5 text-espresso-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272" />
                    </svg>
                  </div>
                )}
                <div className="min-w-0">
                  <Link
                    to={`/products/${item.product.slug}`}
                    className="font-medium text-stone-900 hover:text-espresso-800 transition-colors text-sm truncate block"
                  >
                    {item.product.name}
                  </Link>
                  {item.variant && (
                    <p className="text-xs text-stone-400">
                      {item.variant.name}{item.variant.grind ? ` · ${item.variant.grind.replace('_', ' ')}` : ''}
                    </p>
                  )}
                  <p className="text-stone-500 text-xs">Qty {item.quantity} × {formatPrice(item.unitPriceOre)}</p>
                </div>
              </div>
              <span className="font-medium text-stone-900 text-sm tabular-nums flex-shrink-0">
                {formatPrice(item.unitPriceOre * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-stone-200 pt-4 mt-2 flex justify-between items-center">
          <span className="font-semibold text-stone-900">Total</span>
          <span className="font-serif text-xl font-semibold text-espresso-800 tabular-nums">
            {formatPrice(order.totalOre)}
          </span>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap print:hidden">
        <button
          onClick={() => window.print()}
          className="btn-secondary text-sm flex items-center gap-1.5 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print
        </button>
        <Link to="/products" className="btn-secondary text-sm">
          Continue shopping
        </Link>
        <Link to="/orders" className="btn-ghost text-sm">
          All orders
        </Link>
        {canCancel && (
          <button
            onClick={() => setShowConfirm(true)}
            className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors ml-auto cursor-pointer min-h-[44px] px-2"
          >
            Cancel order
          </button>
        )}
        {canReturn && (
          <button
            onClick={() => setShowReturn(true)}
            className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors ml-auto cursor-pointer min-h-[44px] px-2"
          >
            Request a return
          </button>
        )}
      </div>

      {/* Return request modal */}
      {showReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-warm">
            <h3 className="text-lg font-semibold text-stone-900 mb-4">Request a return</h3>
            <div className="space-y-3 mb-4">
              {order!.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-stone-700">{item.product.name} (qty {item.quantity})</span>
                  <input
                    type="number"
                    min={0}
                    max={item.quantity}
                    value={selectedItems[item.id] ?? 0}
                    onChange={(e) => setSelectedItems((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))}
                    className="w-16 px-2 py-1 border border-stone-300 rounded text-center"
                  />
                </div>
              ))}
            </div>
            <div className="mb-5">
              <label className="block text-sm font-medium text-stone-700 mb-1">Reason</label>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
              >
                <option value="">Select a reason</option>
                <option value="wrong_product">Wrong product</option>
                <option value="damaged">Damaged / defective</option>
                <option value="not_as_described">Not as described</option>
                <option value="changed_mind">Changed my mind</option>
              </select>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowReturn(false)}
                className="text-sm font-medium text-stone-600 hover:text-stone-900 cursor-pointer min-h-[44px] px-4"
              >
                Cancel
              </button>
              <Button
                onClick={() => returnMutation.mutate()}
                loading={returnMutation.isPending}
                disabled={!returnReason || Object.values(selectedItems).every((q) => q === 0)}
              >
                Submit request
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm cancel modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-warm">
            <h3 className="text-lg font-semibold text-stone-900 mb-2">Cancel this order?</h3>
            <p className="text-stone-500 text-sm mb-6">Stock will be restored. This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors cursor-pointer min-h-[44px] px-4"
              >
                Keep order
              </button>
              <Button
                onClick={() => cancelMutation.mutate()}
                loading={cancelMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-sm"
              >
                Yes, cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
