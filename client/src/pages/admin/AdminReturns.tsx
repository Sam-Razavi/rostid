import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { fetchAdminReturns, updateAdminReturn, type AdminReturn } from '../../api/admin.api';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';

function formatPrice(ore: number | null | undefined) {
  return `${Math.round((ore ?? 0) / 100)} kr`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('sv-SE', { year: 'numeric', month: 'short', day: 'numeric' });
}

function defaultRefundOre(ret: AdminReturn) {
  if (ret.refundOre) return ret.refundOre;
  const orderItems = ret.order?.items ?? [];
  return ret.items.reduce((sum, item) => {
    const orderItem = orderItems.find((candidate) => candidate.id === item.orderItemId);
    return sum + (orderItem ? orderItem.unitPriceOre * item.quantity : 0);
  }, 0);
}

export default function AdminReturns() {
  const qc = useQueryClient();
  const { data: returns = [], isLoading } = useQuery({
    queryKey: ['admin', 'returns'],
    queryFn: fetchAdminReturns,
  });

  const update = useMutation({
    mutationFn: ({ id, status, refundOre }: { id: string; status: 'approved' | 'rejected'; refundOre?: number }) =>
      updateAdminReturn(id, { status, refundOre }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'returns'] });
      toast.success('Return updated');
    },
    onError: () => toast.error('Failed to update return'),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-stone-900">Returns</h1>
        <span className="text-sm text-stone-500">{returns.filter((ret) => ret.status === 'pending').length} pending</span>
      </div>

      <div className="bg-white rounded-xl shadow-soft border border-stone-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-xs text-stone-500 uppercase tracking-wide">
                <th className="text-left px-6 py-3 font-medium">Return</th>
                <th className="text-left px-4 py-3 font-medium">Customer</th>
                <th className="text-left px-4 py-3 font-medium">Items</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {returns.map((ret) => (
                <tr key={ret.id} className="hover:bg-stone-50">
                  <td className="px-6 py-4">
                    <p className="font-mono text-xs text-stone-500">#{ret.id.slice(-8).toUpperCase()}</p>
                    <Link to={`/admin/orders/${ret.orderId}`} className="text-xs text-espresso-700 hover:text-espresso-900">
                      Order #{ret.orderId.slice(-8).toUpperCase()}
                    </Link>
                    <p className="text-xs text-stone-400 mt-1">{formatDate(ret.createdAt)}</p>
                    <p className="text-sm text-stone-700 mt-2 capitalize">{ret.reason.replace(/_/g, ' ')}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-stone-900">{ret.order?.user?.name ?? 'Unknown'}</p>
                    <p className="text-xs text-stone-500">{ret.order?.user?.email ?? ''}</p>
                  </td>
                  <td className="px-4 py-4 text-stone-600">
                    <p>{ret.items.reduce((sum, item) => sum + item.quantity, 0)} item(s)</p>
                    <p className="text-xs text-stone-400">Refund estimate {formatPrice(defaultRefundOre(ret))}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      ret.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      ret.status === 'refunded' ? 'bg-green-100 text-green-700' :
                      ret.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-stone-100 text-stone-600'
                    }`}>
                      {ret.status}
                    </span>
                    {ret.stripeRefundId && <p className="text-xs text-stone-400 mt-1">{ret.stripeRefundId}</p>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {ret.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => update.mutate({ id: ret.id, status: 'approved', refundOre: defaultRefundOre(ret) })}
                          loading={update.isPending}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => update.mutate({ id: ret.id, status: 'rejected' })}
                          loading={update.isPending}
                        >
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-stone-400">Closed</span>
                    )}
                  </td>
                </tr>
              ))}
              {returns.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-stone-400">No returns yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
