import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchNewsletterSubscribers, deleteNewsletterSubscriber } from '../../api/admin.api';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-SE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function AdminNewsletter() {
  const queryClient = useQueryClient();

  const { data: subscribers, isLoading } = useQuery({
    queryKey: ['admin', 'newsletter'],
    queryFn: fetchNewsletterSubscribers,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNewsletterSubscriber,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'newsletter'] });
      toast.success('Subscriber removed');
    },
    onError: () => toast.error('Failed to remove subscriber'),
  });

  function handleExport() {
    window.open('/api/admin/newsletter/export', '_blank');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Newsletter</h1>
          {subscribers && (
            <p className="text-stone-500 text-sm mt-1">{subscribers.length} subscribers</p>
          )}
        </div>
        <button onClick={handleExport} className="btn-secondary text-sm">
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-soft border border-stone-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-stone-400 text-sm">Loading…</div>
        ) : !subscribers?.length ? (
          <div className="p-12 text-center text-stone-400">
            <p className="font-serif text-xl mb-2">No subscribers yet</p>
            <p className="text-sm">Subscribers will appear here as they sign up.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Subscribed
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-stone-900">{sub.email}</td>
                  <td className="px-6 py-4 text-stone-500">{formatDate(sub.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => deleteMutation.mutate(sub.id)}
                      disabled={deleteMutation.isPending}
                      className="text-xs text-red-500 hover:text-red-700 transition-colors font-medium cursor-pointer"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
