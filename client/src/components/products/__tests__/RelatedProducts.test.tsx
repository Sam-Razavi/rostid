import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RelatedProducts } from '../RelatedProducts';

vi.mock('../../../api/products.api', () => ({
  fetchProducts: vi.fn(),
}));

import { fetchProducts } from '../../../api/products.api';

const mockFetchProducts = fetchProducts as ReturnType<typeof vi.fn>;

const makeProduct = (id: string) => ({
  id,
  name: `Product ${id}`,
  slug: `product-${id}`,
  description: 'desc',
  priceOre: 9900,
  stock: 10,
  categoryId: 'cat-1',
  category: { id: 'cat-1', name: 'Coffee', slug: 'coffee' },
  roastLevel: 'medium',
  origin: 'Ethiopia',
  tastingNotes: null,
  imageUrl: null,
  weightGrams: 250,
  isActive: true,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
});

function renderRelated(props: Partial<React.ComponentProps<typeof RelatedProducts>> = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <RelatedProducts
          categorySlug="coffee"
          excludeId="p-main"
          onAddToCart={vi.fn()}
          {...props}
        />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('RelatedProducts', () => {
  it('renders nothing when no related products exist', async () => {
    mockFetchProducts.mockResolvedValue({ products: [], total: 0 });
    const { container } = renderRelated();
    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('renders product grid when products are returned', async () => {
    mockFetchProducts.mockResolvedValue({
      products: [makeProduct('p1'), makeProduct('p2')],
      total: 2,
    });
    renderRelated();
    await waitFor(() => {
      expect(screen.getByText('Product p1')).toBeInTheDocument();
      expect(screen.getByText('Product p2')).toBeInTheDocument();
    });
  });

  it('renders the section heading', async () => {
    mockFetchProducts.mockResolvedValue({
      products: [makeProduct('p3')],
      total: 1,
    });
    renderRelated();
    await waitFor(() => {
      expect(screen.getByText('You might also like')).toBeInTheDocument();
    });
  });
});
