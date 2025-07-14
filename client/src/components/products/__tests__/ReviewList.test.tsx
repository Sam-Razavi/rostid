import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReviewList } from '../ReviewList';
import type { Review } from '../../../types';

const makeReview = (overrides: Partial<Review> = {}): Review => ({
  id: 'r1',
  productId: 'p1',
  rating: 4,
  body: 'Great coffee!',
  createdAt: '2025-03-15T10:00:00Z',
  user: { id: 'u1', name: 'Alice' },
  ...overrides,
});

describe('ReviewList', () => {
  it('renders empty state when count is 0', () => {
    render(<ReviewList reviews={[]} avgRating={null} count={0} />);
    expect(screen.getByText(/no reviews yet/i)).toBeInTheDocument();
  });

  it('renders review author name', () => {
    render(<ReviewList reviews={[makeReview()]} avgRating={4} count={1} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('renders review body text', () => {
    render(<ReviewList reviews={[makeReview({ body: 'Fantastic roast' })]} avgRating={5} count={1} />);
    expect(screen.getByText('Fantastic roast')).toBeInTheDocument();
  });

  it('does not render body element when review has no body', () => {
    render(<ReviewList reviews={[makeReview({ body: null })]} avgRating={4} count={1} />);
    expect(screen.queryByText('Great coffee!')).not.toBeInTheDocument();
  });

  it('renders the Reviews heading', () => {
    render(<ReviewList reviews={[]} avgRating={null} count={0} />);
    expect(screen.getByText('Reviews')).toBeInTheDocument();
  });

  it('shows average rating and count when reviews exist', () => {
    render(<ReviewList reviews={[makeReview()]} avgRating={4.2} count={3} />);
    expect(screen.getByText(/4\.2/)).toBeInTheDocument();
    expect(screen.getByText(/\(3\)/)).toBeInTheDocument();
  });

  it('renders star rating with accessible label', () => {
    render(<ReviewList reviews={[makeReview({ rating: 4 })]} avgRating={4} count={1} />);
    const stars = screen.getAllByLabelText(/out of 5 stars/i);
    expect(stars.length).toBeGreaterThan(0);
  });

  it('renders multiple reviews', () => {
    const reviews = [
      makeReview({ id: 'r1', user: { id: 'u1', name: 'Alice' } }),
      makeReview({ id: 'r2', user: { id: 'u2', name: 'Bob' }, body: 'Excellent!' }),
    ];
    render(<ReviewList reviews={reviews} avgRating={4.5} count={2} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Excellent!')).toBeInTheDocument();
  });
});
