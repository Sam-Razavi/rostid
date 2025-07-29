import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAdminCustomers } from '../../api/admin.api';
import { Skeleton } from '../../components/ui/Skeleton';

function formatPrice(ore: number) {
  return `${Math.round(ore / 100).toLocaleString('sv-SE')} kr`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-SE', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function AdminCustomers() {
  const [search, setSearch] = useState('');

  const { data: customers, isLoading } = useQuery({
    queryKey: ['admin', 'customers'],
    queryFn: fetchAdminCustomers,
  });

  const filtered = customers?.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-stone-900">Customers</h1>
        <span className="text-stone-500 text-sm">{filtered?.length ?? 0} of {customers?.length ?? 0}</span>
      </div>

      <div className="mb-5">
        <input
          type="search"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-xs text-sm py-2"
        />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50">
                <th className="text-left px-4 py-3 font-medium text-stone-500">Name</th>
                <th className="text-left px-4 py-3 font-medium text-stone-500">Email</th>
                <th className="text-left px-4 py-3 font-medium text-stone-500">Joined</th>
                <th className="text-right px-4 py-3 font-medium text-stone-500">Orders</th>
                <th className="text-right px-4 py-3 font-medium text-stone-500">Total spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(5)].map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-4 w-24 rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                : filtered?.map((c) => (
                    <tr key={c.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-stone-900">{c.name}</td>
                      <td className="px-4 py-3 text-stone-600">{c.email}</td>
                      <td className="px-4 py-3 text-stone-500">{formatDate(c.createdAt)}</td>
                      <td className="px-4 py-3 text-right text-stone-700 tabular-nums">{c.orderCount}</td>
                      <td className="px-4 py-3 text-right font-medium text-espresso-800 tabular-nums">
                        {formatPrice(c.totalSpendOre)}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
