import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { fetchAdminStats } from '../../api/admin.api';
import { OrderStatusBadge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';

function formatPrice(ore: number) {
  return `${Math.round(ore / 100).toLocaleString('sv-SE')} kr`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-SE', { month: 'short', day: 'numeric' });
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#d97706',
  confirmed: '#3b82f6',
  processing: '#f59e0b',
  shipped: '#6366f1',
  delivered: '#16a34a',
  cancelled: '#dc2626',
};

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

  const pieData = (stats?.ordersByStatus ?? []).map((s) => ({
    name: s.status.charAt(0).toUpperCase() + s.status.slice(1),
    value: s._count.id,
    color: STATUS_COLORS[s.status] ?? '#a8a29e',
  }));

  const recentBarData = (stats?.recentOrders ?? [])
    .slice()
    .reverse()
    .map((o) => ({
      date: formatDate(o.createdAt),
      revenue: Math.round(o.totalOre / 100),
    }));

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900 mb-8">Dashboard</h1>

      {/* Stat cards */}
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Revenue bar chart */}
        <div className="bg-white rounded-xl shadow-soft border border-stone-100 p-6">
          <h2 className="font-semibold text-stone-900 mb-6">Recent order revenue (kr)</h2>
          {isLoading ? (
            <Skeleton className="h-48 w-full rounded-lg" />
          ) : recentBarData.length === 0 ? (
            <p className="text-sm text-stone-500 text-center py-12">No order data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={recentBarData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#78716c' }} />
                <YAxis tick={{ fontSize: 11, fill: '#78716c' }} />
                <Tooltip
                  formatter={(value: number) => [`${value} kr`, 'Revenue']}
                  contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e7e5e4', fontSize: 12 }}
                />
                <Bar dataKey="revenue" fill="#5E3516" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Orders by status donut */}
        <div className="bg-white rounded-xl shadow-soft border border-stone-100 p-6">
          <h2 className="font-semibold text-stone-900 mb-6">Orders by status</h2>
          {isLoading ? (
            <Skeleton className="h-48 w-full rounded-lg" />
          ) : pieData.length === 0 ? (
            <p className="text-sm text-stone-500 text-center py-12">No order data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [value, name]}
                  contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e7e5e4', fontSize: 12 }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent orders table */}
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
                  <span className="font-semibold text-stone-900 text-sm tabular-nums">
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
