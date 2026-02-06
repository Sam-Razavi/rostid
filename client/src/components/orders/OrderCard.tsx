import { Link } from 'react-router-dom';
import { OrderStatusBadge } from '../ui/Badge';
import type { Order } from '../../types';

function formatPrice(ore: number) {
  return `${Math.round(ore / 100)} kr`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function OrderCard({ order }: { order: Order }) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-xs text-stone-500 font-mono mb-1">#{order.id.slice(-8).toUpperCase()}</p>
          <p className="text-sm text-stone-600">{formatDate(order.createdAt)}</p>
        </div>
        <div className="text-right">
          <OrderStatusBadge status={order.status} />
          <p className="font-serif text-lg font-semibold text-espresso-800 mt-1">
            {formatPrice(order.totalOre)}
          </p>
        </div>
      </div>
      <Link
        to={`/orders/${order.id}`}
        className="text-xs text-espresso-700 hover:text-espresso-900 font-medium transition-colors"
      >
        View details →
      </Link>

      <div className="space-y-2 border-t border-stone-100 pt-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-espresso-50 shrink-0">
              {item.product.imageUrl ? (
                <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-serif text-sm text-espresso-200">R</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-900 truncate">{item.product.name}</p>
              <p className="text-xs text-stone-500">
                {item.quantity} × {formatPrice(item.unitPriceOre)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
