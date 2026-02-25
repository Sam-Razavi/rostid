import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchAdminOrders, updateOrderStatus } from '../../api/admin.api';
import { OrderStatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import type { OrderStatus } from '../../types';
import type { AdminOrder } from '../../api/admin.api';

function exportCSV(orders: AdminOrder[]) {
  const headers = ['Order ID', 'Customer', 'Email', 'Status', 'Total (kr)', 'Date'];
  const rows = orders.map((o) => [
    o.id,
    o.user?.name ?? '',
    o.user?.email ?? '',
    o.status,
    (Math.round(o.totalOre / 100)).toString(),
    new Date(o.createdAt).toISOString().slice(0, 10),
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rostid-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success('CSV downloaded');
}

function formatPrice(ore: number) {
  return `${Math.round(ore / 100)} kr`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-SE', { year: 'numeric', month: 'short', day: 'numeric' });
}

const STATUS_FLOW: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function AdminOrders() {
  const qc = useQueryClient();
  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: fetchAdminOrders,
  });

  const statusUpdate = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateOrderStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'orders'] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-stone-900">Orders</h1>
        {orders && orders.length > 0 && (
          <Button variant="secondary" size="sm" onClick={() => exportCSV(orders)}>
            Export CSV
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-soft border border-stone-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 text-xs text-stone-500 uppercase tracking-wide">
              <th className="text-left px-6 py-3 font-medium">Order</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Customer</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Total</th>
              <th className="text-right px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-4 py-4 hidden md:table-cell"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                    <td className="px-4 py-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                    <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-32 ml-auto rounded-lg" /></td>
                  </tr>
                ))
              : orders?.map((order) => {
                  const currentIdx = STATUS_FLOW.indexOf(order.status as OrderStatus);
                  const nextStatus = currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null;

                  return (
                    <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-mono text-xs text-stone-500 mb-0.5">
                          #{order.id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-stone-600">{formatDate(order.createdAt)}</p>
                        <p className="text-xs text-stone-400 mt-0.5">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <p className="font-medium text-stone-900">{order.user.name}</p>
                        <p className="text-xs text-stone-500">{order.user.email}</p>
                      </td>
                      <td className="px-4 py-4">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-stone-900">
                        {formatPrice(order.totalOre)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {order.status !== 'cancelled' && order.status !== 'delivered' && (
                          <div className="flex items-center justify-end gap-2">
                            {nextStatus && (
                              <button
                                onClick={() => statusUpdate.mutate({ id: order.id, status: nextStatus })}
                                disabled={statusUpdate.isPending}
                                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-espresso-800 text-white hover:bg-espresso-700 cursor-pointer transition-colors disabled:opacity-50 capitalize"
                              >
                                Mark {nextStatus}
                              </button>
                            )}
                            <button
                              onClick={() => statusUpdate.mutate({ id: order.id, status: 'cancelled' })}
                              disabled={statusUpdate.isPending}
                              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer transition-colors disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
