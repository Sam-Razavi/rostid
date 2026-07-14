import { useState, FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchAdminDiscounts, createAdminDiscount, deleteAdminDiscount } from '../../api/admin.api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-SE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function AdminDiscounts() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState('');
  const [minOrder, setMinOrder] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const { data: discounts, isLoading } = useQuery({
    queryKey: ['admin', 'discounts'],
    queryFn: fetchAdminDiscounts,
  });

  const createMutation = useMutation({
    mutationFn: createAdminDiscount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'discounts'] });
      toast.success('Discount code created');
      setShowForm(false);
      setCode('');
      setValue('');
      setMinOrder('');
      setMaxUses('');
      setExpiresAt('');
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to create code';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminDiscount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'discounts'] });
      toast.success('Code deleted');
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    createMutation.mutate({
      code: code.toUpperCase(),
      type,
      value: Number(value),
      minOrderOre: minOrder ? Math.round(Number(minOrder) * 100) : undefined,
      maxUses: maxUses ? Number(maxUses) : undefined,
      expiresAt: expiresAt || undefined,
    });
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-stone-900">Discount codes</h1>
        <Button onClick={() => setShowForm((v) => !v)} size="sm">
          {showForm ? 'Cancel' : 'Create code'}
        </Button>
      </div>

      {showForm && (
        <div className="card p-6 mb-8">
          <h2 className="font-semibold text-stone-900 mb-5">New discount code</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
              placeholder="SUMMER20"
            />
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'percentage' | 'fixed')}
                className="w-full px-4 py-3 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-espresso-500 text-sm"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed amount (SEK)</option>
              </select>
            </div>
            <Input
              label={type === 'percentage' ? 'Value (%)' : 'Value (SEK)'}
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
              min={1}
              placeholder={type === 'percentage' ? '20' : '50'}
            />
            <Input
              label="Min order (SEK, optional)"
              type="number"
              value={minOrder}
              onChange={(e) => setMinOrder(e.target.value)}
              placeholder="200"
            />
            <Input
              label="Max uses (optional)"
              type="number"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              placeholder="100"
            />
            <Input
              label="Expires at (optional)"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
            <div className="sm:col-span-2 flex justify-end">
              <Button type="submit" loading={createMutation.isPending}>
                Create code
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50">
                <th className="text-left px-4 py-3 font-medium text-stone-500">Code</th>
                <th className="text-left px-4 py-3 font-medium text-stone-500">Type</th>
                <th className="text-right px-4 py-3 font-medium text-stone-500">Value</th>
                <th className="text-right px-4 py-3 font-medium text-stone-500">Used</th>
                <th className="text-left px-4 py-3 font-medium text-stone-500">Expires</th>
                <th className="text-left px-4 py-3 font-medium text-stone-500">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading
                ? [...Array(3)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(7)].map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-4 w-16 rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                : discounts?.map((d) => (
                    <tr key={d.id} className="hover:bg-stone-50">
                      <td className="px-4 py-3 font-mono font-semibold text-stone-900">{d.code}</td>
                      <td className="px-4 py-3 text-stone-600 capitalize">{d.type}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {d.type === 'percentage' ? `${d.value}%` : `${d.value / 100} kr`}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-stone-600">
                        {d.usedCount}
                        {d.maxUses ? `/${d.maxUses}` : ''}
                      </td>
                      <td className="px-4 py-3 text-stone-500">
                        {d.expiresAt ? formatDate(d.expiresAt) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${d.isActive ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}
                        >
                          {d.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => deleteMutation.mutate(d.id)}
                          className="text-xs text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
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
