import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';
import type { ApiResponse } from '../../types';

interface AdminSubscription {
  id: string;
  userId: string;
  productId: string;
  intervalDays: number;
  status: string;
  nextBillingDate: string;
  createdAt: string;
  user: { name: string; email: string };
  product: { name: string; priceOre: number };
}

function formatPrice(ore: number) {
  return `${Math.round(ore / 100)} kr`;
}

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('sv-SE');
}

export default function AdminSubscriptions() {
  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: async () => {
      const { data } =
        await apiClient.get<ApiResponse<AdminSubscription[]>>('/admin/subscriptions');
      return data.data;
    },
  });

  const active = subscriptions.filter((s) => s.status === 'active');
  const mrrOre = active.reduce((sum, sub) => {
    const multiplier = 30 / sub.intervalDays;
    return sum + Math.round(sub.product.priceOre * 0.9 * multiplier);
  }, 0);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-stone-100 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-stone-900">Subscriptions</h1>
        <div className="text-right">
          <p className="text-xs text-stone-500 uppercase tracking-wide">MRR</p>
          <p className="font-serif text-xl font-semibold text-espresso-800">
            {formatPrice(mrrOre)}
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-100">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-stone-600">Customer</th>
              <th className="px-4 py-3 text-left font-medium text-stone-600">Product</th>
              <th className="px-4 py-3 text-left font-medium text-stone-600">Frequency</th>
              <th className="px-4 py-3 text-left font-medium text-stone-600">Status</th>
              <th className="px-4 py-3 text-left font-medium text-stone-600">Next billing</th>
              <th className="px-4 py-3 text-right font-medium text-stone-600">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-stone-900">{sub.user.name}</p>
                  <p className="text-xs text-stone-400">{sub.user.email}</p>
                </td>
                <td className="px-4 py-3 text-stone-700">{sub.product.name}</td>
                <td className="px-4 py-3 text-stone-600">Every {sub.intervalDays} days</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                      sub.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : sub.status === 'paused'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-stone-600">{formatDate(sub.nextBillingDate)}</td>
                <td className="px-4 py-3 text-right font-medium text-stone-900">
                  {formatPrice(Math.round(sub.product.priceOre * 0.9))}
                </td>
              </tr>
            ))}
            {subscriptions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-stone-400">
                  No subscriptions yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
