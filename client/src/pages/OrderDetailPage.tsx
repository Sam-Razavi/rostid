import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchOrder } from '../api/orders.api';
import { OrderStatusBadge } from '../components/ui/Badge';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { OrderCardSkeleton } from '../components/ui/Skeleton';
import { OrderTimeline } from '../components/orders/OrderTimeline';

function formatPrice(ore: number) {
  return `${Math.round(ore / 100)} kr`;
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

  const { data: order, isLoading, isError, refetch } = useQuery({
    queryKey: ['order', id],
    queryFn: () => fetchOrder(id!),
    enabled: !!id,
  });

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

      <div className="flex gap-3">
        <Link to="/products" className="btn-secondary text-sm">
          Continue shopping
        </Link>
        <Link to="/orders" className="btn-ghost text-sm">
          All orders
        </Link>
      </div>
    </div>
  );
}
