import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchOrders } from '../api/orders.api';
import { OrderCard } from '../components/orders/OrderCard';
import { OrderCardSkeleton } from '../components/ui/Skeleton';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';

const PAGE_SIZE = 10;

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const {
    data: orders,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });

  const filtered = statusFilter ? orders?.filter((o) => o.status === statusFilter) : orders;
  const totalPages = filtered ? Math.ceil(filtered.length / PAGE_SIZE) : 1;
  const pageOrders = filtered?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleStatusChange(value: string) {
    setStatusFilter(value);
    setPage(1);
  }

  return (
    <div className="container-page py-12">
      <h1 className="font-serif text-4xl font-semibold text-stone-900 mb-6">Your orders</h1>

      <div className="flex flex-wrap gap-2 mb-8">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => handleStatusChange(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              statusFilter === f.value
                ? 'bg-espresso-800 text-white'
                : 'bg-white border border-stone-200 text-stone-600 hover:border-espresso-400 hover:text-espresso-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4 max-w-2xl">
          {[1, 2, 3].map((i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16">
          <p className="text-stone-500">Failed to load orders. Please try again.</p>
        </div>
      ) : orders?.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Your order history will appear here once you make a purchase."
          action={
            <Link to="/products" className="btn-primary inline-flex">
              Shop coffee
            </Link>
          }
        />
      ) : filtered?.length === 0 ? (
        <EmptyState
          title="No orders match this filter"
          description="Try selecting a different status above."
        />
      ) : (
        <div className="max-w-2xl">
          <div className="space-y-4">
            {pageOrders?.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
