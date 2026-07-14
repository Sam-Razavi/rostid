import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchAdminCustomers, updateCustomerNote, adminAdjustLoyalty } from '../../api/admin.api';
import { Skeleton } from '../../components/ui/Skeleton';

function formatPrice(ore: number) {
  return `${Math.round(ore / 100).toLocaleString('sv-SE')} kr`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-SE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function AdminCustomers() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState('');
  const [loyaltyModalId, setLoyaltyModalId] = useState<string | null>(null);
  const [loyaltyDelta, setLoyaltyDelta] = useState('');
  const [loyaltyReason, setLoyaltyReason] = useState('');

  const noteMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => updateCustomerNote(id, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'customers'] });
      setEditingNoteId(null);
      toast.success('Note saved');
    },
    onError: () => toast.error('Failed to save note'),
  });

  const loyaltyMutation = useMutation({
    mutationFn: ({ id, delta, reason }: { id: string; delta: number; reason: string }) =>
      adminAdjustLoyalty(id, delta, reason),
    onSuccess: (result) => {
      toast.success(`Points adjusted. New balance: ${result.points} pts`);
      setLoyaltyModalId(null);
      setLoyaltyDelta('');
      setLoyaltyReason('');
    },
    onError: () => toast.error('Failed to adjust points'),
  });

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
        <span className="text-stone-500 text-sm">
          {filtered?.length ?? 0} of {customers?.length ?? 0}
        </span>
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
                <th className="text-left px-4 py-3 font-medium text-stone-500">Admin note</th>
                <th className="px-4 py-3" />
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
                      <td className="px-4 py-3 text-right text-stone-700 tabular-nums">
                        {c.orderCount}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-espresso-800 tabular-nums">
                        {formatPrice(c.totalSpendOre)}
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        {editingNoteId === c.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={noteValue}
                              onChange={(e) => setNoteValue(e.target.value)}
                              className="input-field text-xs py-1 flex-1"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter')
                                  noteMutation.mutate({ id: c.id, note: noteValue });
                                if (e.key === 'Escape') setEditingNoteId(null);
                              }}
                            />
                            <button
                              onClick={() => noteMutation.mutate({ id: c.id, note: noteValue })}
                              className="text-xs text-espresso-700 font-medium cursor-pointer hover:text-espresso-900"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingNoteId(c.id);
                              setNoteValue(
                                (c as unknown as { adminNote?: string }).adminNote ?? ''
                              );
                            }}
                            className="text-xs text-stone-500 hover:text-stone-800 cursor-pointer truncate max-w-full text-left"
                          >
                            {(c as unknown as { adminNote?: string }).adminNote || (
                              <span className="text-stone-300">+ Add note</span>
                            )}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => {
                            setLoyaltyModalId(c.id);
                            setLoyaltyDelta('');
                            setLoyaltyReason('');
                          }}
                          className="text-xs text-espresso-700 hover:text-espresso-900 font-medium cursor-pointer"
                        >
                          Adjust pts
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {loyaltyModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-lg">
            <h3 className="text-lg font-semibold text-stone-900 mb-1">Adjust loyalty points</h3>
            <p className="text-sm text-stone-500 mb-5">
              Use a positive number to credit, negative to debit.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Points (e.g. 100 or -50)
                </label>
                <input
                  type="number"
                  value={loyaltyDelta}
                  onChange={(e) => setLoyaltyDelta(e.target.value)}
                  className="input-field text-sm py-2 w-full"
                  placeholder="100"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Reason</label>
                <input
                  type="text"
                  value={loyaltyReason}
                  onChange={(e) => setLoyaltyReason(e.target.value)}
                  className="input-field text-sm py-2 w-full"
                  placeholder="Compensation for delayed order"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setLoyaltyModalId(null)}
                className="text-sm font-medium text-stone-600 hover:text-stone-900 cursor-pointer px-4 min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const delta = parseInt(loyaltyDelta, 10);
                  if (!delta || !loyaltyReason.trim()) return;
                  loyaltyMutation.mutate({
                    id: loyaltyModalId,
                    delta,
                    reason: loyaltyReason.trim(),
                  });
                }}
                disabled={loyaltyMutation.isPending || !loyaltyDelta || !loyaltyReason.trim()}
                className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loyaltyMutation.isPending ? 'Saving…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
