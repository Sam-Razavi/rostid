import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import NotFoundPage from '../NotFoundPage';

vi.mock('../../api/products.api', () => ({
  fetchCategories: vi.fn().mockResolvedValue([
    { id: '1', slug: 'single-origin', name: 'Single Origin' },
    { id: '2', slug: 'blends', name: 'Blends' },
  ]),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('NotFoundPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders 404 and page-not-found heading', () => {
    render(<NotFoundPage />, { wrapper });
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument();
  });

  it('renders a search input', () => {
    render(<NotFoundPage />, { wrapper });
    expect(screen.getByPlaceholderText(/search coffees/i)).toBeInTheDocument();
  });

  it('navigates to products search on form submit', () => {
    render(<NotFoundPage />, { wrapper });
    fireEvent.change(screen.getByPlaceholderText(/search coffees/i), {
      target: { value: 'Ethiopian' },
    });
    fireEvent.submit(screen.getByPlaceholderText(/search coffees/i).closest('form')!);
    expect(mockNavigate).toHaveBeenCalledWith('/products?search=Ethiopian');
  });

  it('does not navigate on empty search', () => {
    render(<NotFoundPage />, { wrapper });
    fireEvent.submit(screen.getByPlaceholderText(/search coffees/i).closest('form')!);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('renders back-to-home link', () => {
    render(<NotFoundPage />, { wrapper });
    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute('href', '/');
  });
});
