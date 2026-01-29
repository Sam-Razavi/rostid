import { useQuery } from '@tanstack/react-query';
import { fetchAdminStats } from '../../api/admin.api';
import { OrderStatusBadge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';

function formatPrice(ore: number) {
  return `${Math.round(ore / 100).toLocaleString('sv-SE')} kr`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-SE', { month: 'short', day: 'numeric' });
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: fetchAdminStats,
    refetchInterval: 30000,
  });

  const statCards = [
    { label: 'Total orders', value: stats?.totalOrders ?? 0, format: (v: number) => v.toString() },
    { label: 'Revenue', value: stats?.totalRevenueOre ?? 0, format: formatPrice },
    { label: 'Products', value: stats?.totalProducts ?? 0, format: (v: number) => v.toString() },
    { label: 'Customers', value: stats?.totalCustomers ?? 0, format: (v: number) => v.toString() },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-6 shadow-soft border border-stone-100">
            <p className="text-sm text-stone-500 font-medium">{card.label}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mt-2" />
            ) : (
              <p className="font-serif text-2xl font-semibold text-stone-900 mt-2">
                {card.format(card.value)}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-soft border border-stone-100">
        <div className="px-6 py-4 border-b border-stone-100">
          <h2 className="font-semibold text-stone-900">Recent orders</h2>
        </div>
        <div className="divide-y divide-stone-100">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24 ml-auto" />
              </div>
            ))
          ) : stats?.recentOrders.length === 0 ? (
            <p className="px-6 py-8 text-sm text-stone-500 text-center">No orders yet</p>
          ) : (
            stats?.recentOrders.map((order) => (
              <div key={order.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-stone-900">
                    {order.user?.name ?? 'Unknown'}
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5 font-mono">
                    #{order.id.slice(-8).toUpperCase()} · {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <OrderStatusBadge status={order.status} />
                  <span className="font-semibold text-stone-900 text-sm">
                    {formatPrice(order.totalOre)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
