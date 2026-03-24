import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AddReviewForm } from '../AddReviewForm';
import { useAuthStore } from '../../../store/authStore';

vi.mock('../../../api/reviews.api', () => ({
  createReview: vi.fn().mockResolvedValue({ review: { id: '1', rating: 5 } }),
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

function renderForm(props: { slug?: string; hasReviewed?: boolean } = {}) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <AddReviewForm slug={props.slug ?? 'test-coffee'} hasReviewed={props.hasReviewed ?? false} />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('AddReviewForm', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false });
  });

  it('shows sign-in prompt when not authenticated', () => {
    renderForm();
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    expect(screen.queryByRole('radiogroup')).toBeNull();
  });

  it('shows already-reviewed notice when hasReviewed is true', () => {
    useAuthStore.setState({
      user: { id: '1', email: 'a@b.com', name: 'A', role: 'customer' },
      accessToken: 'tok',
      isAuthenticated: true,
    });
    renderForm({ hasReviewed: true });
    expect(screen.getByText(/already reviewed/i)).toBeInTheDocument();
    expect(screen.queryByRole('radiogroup')).toBeNull();
  });

  it('renders star picker and submit button when authenticated', () => {
    useAuthStore.setState({
      user: { id: '1', email: 'a@b.com', name: 'A', role: 'customer' },
      accessToken: 'tok',
      isAuthenticated: true,
    });
    renderForm();
    expect(screen.getByRole('radiogroup', { name: /rating/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit review/i })).toBeInTheDocument();
  });

  it('submit button is disabled until a star is selected', () => {
    useAuthStore.setState({
      user: { id: '1', email: 'a@b.com', name: 'A', role: 'customer' },
      accessToken: 'tok',
      isAuthenticated: true,
    });
    renderForm();
    expect(screen.getByRole('button', { name: /submit review/i })).toBeDisabled();
  });

  it('enables submit after selecting a rating', () => {
    useAuthStore.setState({
      user: { id: '1', email: 'a@b.com', name: 'A', role: 'customer' },
      accessToken: 'tok',
      isAuthenticated: true,
    });
    renderForm();
    fireEvent.click(screen.getByLabelText('5 stars'));
    expect(screen.getByRole('button', { name: /submit review/i })).not.toBeDisabled();
  });
});
