import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchOrders } from '../api/orders.api';
import { OrderCard } from '../components/orders/OrderCard';
import { OrderCardSkeleton } from '../components/ui/Skeleton';

export default function OrdersPage() {
  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });

  return (
    <div className="container-page py-12">
      <h1 className="font-serif text-4xl font-semibold text-stone-900 mb-10">Your orders</h1>

      {isLoading ? (
        <div className="space-y-4 max-w-2xl">
          {[1, 2, 3].map((i) => <OrderCardSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <div className="text-center py-16">
          <p className="text-stone-500">Failed to load orders. Please try again.</p>
        </div>
      ) : orders?.length === 0 ? (
        <div className="text-center py-24">
          <p className="font-serif text-3xl text-stone-400 mb-3">No orders yet</p>
          <p className="text-stone-500 mb-8">Your order history will appear here.</p>
          <Link to="/products" className="btn-primary inline-flex">
            Shop coffee
          </Link>
        </div>
      ) : (
        <div className="space-y-4 max-w-2xl">
          {orders?.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
