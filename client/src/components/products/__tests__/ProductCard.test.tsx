import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProductCard } from '../ProductCard';
import type { Product } from '../../../types';

const baseProduct: Product = {
  id: 'prod-1',
  name: 'Test Coffee',
  slug: 'test-coffee',
  description: 'A great coffee',
  priceOre: 12900,
  stock: 10,
  categoryId: 'cat-1',
  category: { id: 'cat-1', name: 'Single Origin', slug: 'single-origin' },
  roastLevel: 'medium',
  origin: 'Ethiopia',
  tastingNotes: 'Blueberry, chocolate',
  imageUrl: null,
  weightGrams: 250,
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function renderCard(props: Partial<Parameters<typeof ProductCard>[0]> = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ProductCard product={baseProduct} {...props} />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('ProductCard', () => {
  it('renders product name and price', () => {
    renderCard();
    expect(screen.getByText('Test Coffee')).toBeInTheDocument();
    expect(screen.getByText('129 kr')).toBeInTheDocument();
  });

  it('renders origin and tasting notes', () => {
    renderCard();
    expect(screen.getByText('Ethiopia')).toBeInTheDocument();
    expect(screen.getByText('Blueberry, chocolate')).toBeInTheDocument();
  });

  it('shows add to cart button when handler provided', () => {
    renderCard({ onAddToCart: vi.fn() });
    expect(screen.getByText('Add to cart')).toBeInTheDocument();
  });

  it('calls onAddToCart when button clicked', () => {
    const handler = vi.fn();
    renderCard({ onAddToCart: handler });
    fireEvent.click(screen.getByText('Add to cart'));
    expect(handler).toHaveBeenCalledWith(baseProduct);
  });

  it('shows out-of-stock overlay when stock is 0', () => {
    renderCard({ product: { ...baseProduct, stock: 0 } });
    expect(screen.getByText('Out of stock')).toBeInTheDocument();
  });

  it('disables add-to-cart button when out of stock', () => {
    renderCard({ product: { ...baseProduct, stock: 0 }, onAddToCart: vi.fn() });
    const button = screen.getByRole('button', { name: /unavailable/i });
    expect(button).toBeDisabled();
  });

  it('shows low stock badge when stock <= 5', () => {
    renderCard({ product: { ...baseProduct, stock: 3 } });
    expect(screen.getByText('Only 3 left')).toBeInTheDocument();
  });

  it('does not show low stock badge when stock > 5', () => {
    renderCard();
    expect(screen.queryByText(/only \d+ left/i)).toBeNull();
  });

  it('links to product detail page', () => {
    renderCard();
    const links = screen.getAllByRole('link');
    expect(links.some((l) => l.getAttribute('href') === '/products/test-coffee')).toBe(true);
  });
});
