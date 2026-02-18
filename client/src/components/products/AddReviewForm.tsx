import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createReview } from '../../api/reviews.api';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';

interface AddReviewFormProps {
  slug: string;
  hasReviewed: boolean;
}

function StarPicker({ rating, onChange }: { rating: number; onChange: (r: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {Array.from({ length: 5 }).map((_, i) => {
        const value = i + 1;
        const filled = value <= (hovered || rating);
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === rating}
            aria-label={`${value} star${value !== 1 ? 's' : ''}`}
            onClick={() => onChange(value)}
            onMouseEnter={() => setHovered(value)}
            onMouseLeave={() => setHovered(0)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer transition-transform active:scale-90"
          >
            <svg
              className={`w-7 h-7 transition-colors ${filled ? 'text-amber-400' : 'text-stone-200'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

export function AddReviewForm({ slug, hasReviewed }: AddReviewFormProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState('');
  const qc = useQueryClient();

  const submit = useMutation({
    mutationFn: () => createReview(slug, rating, body || undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews', slug] });
      toast.success('Review submitted!');
      setRating(0);
      setBody('');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to submit review';
      toast.error(msg);
    },
  });

  if (!isAuthenticated) {
    return (
      <p className="text-sm text-stone-500">
        <Link to="/login" className="text-espresso-700 font-medium hover:text-espresso-900 transition-colors">
          Sign in
        </Link>{' '}
        to leave a review.
      </p>
    );
  }

  if (hasReviewed) {
    return (
      <p className="text-sm text-stone-500 bg-stone-50 px-4 py-3 rounded-lg">
        You have already reviewed this product.
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (rating > 0) submit.mutate(); }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">Your rating</label>
        <StarPicker rating={rating} onChange={setRating} />
      </div>

      <div>
        <label htmlFor="review-body" className="block text-sm font-medium text-stone-700 mb-1.5">
          Comment <span className="text-stone-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          maxLength={1000}
          className="input-field resize-none text-sm"
          placeholder="What did you think of this coffee?"
        />
      </div>

      <Button
        type="submit"
        disabled={rating === 0}
        loading={submit.isPending}
        size="sm"
      >
        Submit review
      </Button>
    </form>
  );
}
