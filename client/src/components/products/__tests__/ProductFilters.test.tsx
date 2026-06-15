import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProductFilters } from '../ProductFilters';

vi.mock('../../../api/products.api', () => ({
  fetchCategories: vi.fn().mockResolvedValue([
    { id: 'cat-1', slug: 'single-origin', name: 'Single Origin' },
    { id: 'cat-2', slug: 'blends', name: 'Blends' },
  ]),
}));

function renderFilters(overrides: Partial<Parameters<typeof ProductFilters>[0]> = {}) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const defaults = {
    selectedCategory: '',
    selectedRoast: '',
    search: '',
    sort: 'newest',
    minPrice: '',
    maxPrice: '',
    inStock: false,
    onCategoryChange: vi.fn(),
    onRoastChange: vi.fn(),
    onSearchChange: vi.fn(),
    onSortChange: vi.fn(),
    onMinPriceChange: vi.fn(),
    onMaxPriceChange: vi.fn(),
    onInStockChange: vi.fn(),
    ...overrides,
  };

  return {
    ...render(
      <QueryClientProvider client={qc}>
        <ProductFilters {...defaults} />
      </QueryClientProvider>
    ),
    ...defaults,
  };
}

describe('ProductFilters', () => {
  it('renders search input', () => {
    renderFilters();
    expect(screen.getByPlaceholderText('Search coffees...')).toBeInTheDocument();
  });

  it('calls onSearchChange when search input changes', () => {
    const { onSearchChange } = renderFilters();
    fireEvent.change(screen.getByPlaceholderText('Search coffees...'), { target: { value: 'ethiopia' } });
    expect(onSearchChange).toHaveBeenCalledWith('ethiopia');
  });

  it('renders roast filter with all options', () => {
    renderFilters();
    expect(screen.getByDisplayValue('All roasts')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Light' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Medium' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Dark' })).toBeInTheDocument();
  });

  it('calls onRoastChange when roast is selected', () => {
    const { onRoastChange } = renderFilters();
    const roastSelect = screen.getByDisplayValue('All roasts');
    fireEvent.change(roastSelect, { target: { value: 'light' } });
    expect(onRoastChange).toHaveBeenCalledWith('light');
  });

  it('renders sort select with newest as default', () => {
    renderFilters();
    expect(screen.getByDisplayValue('Newest first')).toBeInTheDocument();
  });

  it('calls onSortChange when sort is changed', () => {
    const { onSortChange } = renderFilters();
    fireEvent.change(screen.getByDisplayValue('Newest first'), { target: { value: 'price_asc' } });
    expect(onSortChange).toHaveBeenCalledWith('price_asc');
  });

  it('renders min and max price inputs', () => {
    renderFilters();
    expect(screen.getByPlaceholderText('Min kr')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Max kr')).toBeInTheDocument();
  });

  it('calls onMinPriceChange when min price changes', () => {
    const { onMinPriceChange } = renderFilters();
    fireEvent.change(screen.getByPlaceholderText('Min kr'), { target: { value: '100' } });
    expect(onMinPriceChange).toHaveBeenCalledWith('100');
  });

  it('calls onMaxPriceChange when max price changes', () => {
    const { onMaxPriceChange } = renderFilters();
    fireEvent.change(screen.getByPlaceholderText('Max kr'), { target: { value: '500' } });
    expect(onMaxPriceChange).toHaveBeenCalledWith('500');
  });

  it('displays current search value', () => {
    renderFilters({ search: 'kenya' });
    expect(screen.getByDisplayValue('kenya')).toBeInTheDocument();
  });
});
