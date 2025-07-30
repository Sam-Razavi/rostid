import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchAdminCustomers, updateCustomerNote } from '../../api/admin.api';
import { Skeleton } from '../../components/ui/Skeleton';

function formatPrice(ore: number) {
  return `${Math.round(ore / 100).toLocaleString('sv-SE')} kr`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-SE', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function AdminCustomers() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState('');

  const noteMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => updateCustomerNote(id, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'customers'] });
      setEditingNoteId(null);
      toast.success('Note saved');
    },
    onError: () => toast.error('Failed to save note'),
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
                <th className="text-left px-4 py-3 font-medium text-stone-500">Admin note</th>
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
                                if (e.key === 'Enter') noteMutation.mutate({ id: c.id, note: noteValue });
                                if (e.key === 'Escape') setEditingNoteId(null);
                              }}
                            />
                            <button onClick={() => noteMutation.mutate({ id: c.id, note: noteValue })} className="text-xs text-espresso-700 font-medium cursor-pointer hover:text-espresso-900">Save</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditingNoteId(c.id); setNoteValue((c as unknown as { adminNote?: string }).adminNote ?? ''); }}
                            className="text-xs text-stone-500 hover:text-stone-800 cursor-pointer truncate max-w-full text-left"
                          >
                            {(c as unknown as { adminNote?: string }).adminNote || <span className="text-stone-300">+ Add note</span>}
                          </button>
                        )}
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
