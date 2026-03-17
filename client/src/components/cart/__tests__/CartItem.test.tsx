import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartItem } from '../CartItem';
import type { CartItem as CartItemType } from '../../../types';

vi.mock('../../../hooks/useCart', () => ({
  useUpdateCartItem: () => ({ mutate: vi.fn(), isPending: false }),
  useRemoveCartItem: () => ({ mutate: vi.fn(), isPending: false }),
}));

const mockItem: CartItemType = {
  id: 'item-1',
  quantity: 2,
  product: {
    id: 'prod-1',
    name: 'Test Coffee',
    slug: 'test-coffee',
    priceOre: 12900,
    stock: 10,
    imageUrl: null,
  },
};

function renderItem(item = mockItem) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <CartItem item={item} />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('CartItem', () => {
  it('renders product name and quantity', () => {
    renderItem();
    expect(screen.getByText('Test Coffee')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders unit price and line total', () => {
    renderItem();
    expect(screen.getByText('129 kr each')).toBeInTheDocument();
    expect(screen.getByText('258 kr')).toBeInTheDocument();
  });

  it('renders decrease and increase buttons', () => {
    renderItem();
    expect(screen.getByLabelText('Decrease quantity')).toBeInTheDocument();
    expect(screen.getByLabelText('Increase quantity')).toBeInTheDocument();
  });

  it('renders remove button', () => {
    renderItem();
    expect(screen.getByText('Remove')).toBeInTheDocument();
  });

  it('disables increase button when at stock limit', () => {
    renderItem({ ...mockItem, quantity: 10 });
    expect(screen.getByLabelText('Increase quantity')).toBeDisabled();
  });

  it('links to product page', () => {
    renderItem();
    const links = screen.getAllByRole('link');
    expect(links.some(l => l.getAttribute('href') === '/products/test-coffee')).toBe(true);
  });
});
