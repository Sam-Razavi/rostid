import type { Review } from '../../types';

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const px = size === 'md' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`${px} ${i < rating ? 'text-amber-400' : 'text-stone-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-SE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function ReviewList({
  reviews,
  avgRating,
  count,
}: {
  reviews: Review[];
  avgRating: number | null;
  count: number;
}) {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h3 className="font-serif text-2xl font-semibold text-stone-900">Reviews</h3>
        {count > 0 && (
          <div className="flex items-center gap-2">
            <StarRating rating={Math.round(avgRating ?? 0)} size="md" />
            <span className="text-stone-500 text-sm">
              {avgRating?.toFixed(1)} ({count})
            </span>
          </div>
        )}
      </div>

      {count === 0 ? (
        <p className="text-stone-500 text-sm">
          No reviews yet. Be the first to share your thoughts.
        </p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-stone-100 pb-6 last:border-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-stone-900 text-sm">{review.user.name}</span>
                  <StarRating rating={review.rating} />
                </div>
                <span className="text-xs text-stone-400">{formatDate(review.createdAt)}</span>
              </div>
              {review.body && (
                <p className="text-stone-600 text-sm leading-relaxed">{review.body}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
