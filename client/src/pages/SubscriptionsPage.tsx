import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  fetchSubscriptions,
  updateSubscription,
  type Subscription,
} from '../api/subscriptions.api';
import { Button } from '../components/ui/Button';

function formatPrice(ore: number) {
  return `${Math.round(ore / 100)} kr`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const INTERVAL_OPTIONS = [14, 30, 60];

function SubscriptionCard({ sub }: { sub: Subscription }) {
  const qc = useQueryClient();

  const update = useMutation({
    mutationFn: (data: { status?: string; intervalDays?: number }) =>
      updateSubscription(sub.id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscriptions'] }),
    onError: () => toast.error('Failed to update subscription'),
  });

  const isPaused = sub.status === 'paused';
  const isCancelled = sub.status === 'cancelled';

  return (
    <div className={`card p-6 ${isCancelled ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          {sub.product.imageUrl ? (
            <img
              src={sub.product.imageUrl}
              alt={sub.product.name}
              className="w-16 h-16 rounded-lg object-cover bg-stone-100"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-espresso-50 flex items-center justify-center">
              <span className="font-serif text-2xl text-espresso-200">R</span>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-stone-900">{sub.product.name}</h3>
            <p className="text-sm text-stone-500">
              Every {sub.intervalDays} days — {formatPrice(Math.round(sub.product.priceOre * 0.9))}{' '}
              / delivery
            </p>
            <span
              className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                sub.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : sub.status === 'paused'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-stone-100 text-stone-500'
              }`}
            >
              {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
            </span>
          </div>
        </div>

        {!isCancelled && (
          <div className="flex gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => update.mutate({ status: isPaused ? 'active' : 'paused' })}
              loading={update.isPending}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-red-600 hover:text-red-700"
              onClick={() => {
                if (confirm('Cancel this subscription?')) update.mutate({ status: 'cancelled' });
              }}
              loading={update.isPending}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {!isCancelled && (
        <>
          <div className="text-sm text-stone-600 mb-3">
            Next delivery:{' '}
            <span className="font-medium text-stone-900">{formatDate(sub.nextBillingDate)}</span>
          </div>

          <div>
            <p className="text-xs text-stone-500 mb-2">Change frequency</p>
            <div className="flex gap-2">
              {INTERVAL_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => update.mutate({ intervalDays: d })}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                    sub.intervalDays === d
                      ? 'border-espresso-800 bg-espresso-50 text-espresso-800'
                      : 'border-stone-200 text-stone-600 hover:border-stone-400'
                  }`}
                >
                  {d} days
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function SubscriptionsPage() {
  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: fetchSubscriptions,
  });

  if (isLoading) {
    return (
      <div className="container-page py-12 max-w-2xl">
        <div className="h-8 bg-stone-200 animate-pulse rounded w-48 mb-8" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 bg-stone-200 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const active = subscriptions.filter((s) => s.status !== 'cancelled');
  const cancelled = subscriptions.filter((s) => s.status === 'cancelled');

  return (
    <div className="container-page py-12 max-w-2xl">
      <h1 className="font-serif text-3xl font-semibold text-stone-900 mb-8">My subscriptions</h1>

      {subscriptions.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-serif text-2xl text-stone-400 mb-3">No subscriptions yet</p>
          <p className="text-stone-500 mb-8">Subscribe & save 10% on your favourite coffee.</p>
          <Link to="/products" className="btn-primary inline-flex">
            Browse coffee
          </Link>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div className="space-y-4 mb-8">
              {active.map((sub) => (
                <SubscriptionCard key={sub.id} sub={sub} />
              ))}
            </div>
          )}

          {cancelled.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-stone-500 uppercase tracking-wide mb-3">
                Cancelled
              </h2>
              <div className="space-y-4">
                {cancelled.map((sub) => (
                  <SubscriptionCard key={sub.id} sub={sub} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
