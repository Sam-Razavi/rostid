import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { OrderCard } from '../OrderCard';
import type { Order } from '../../../types';

const baseOrder: Order = {
  id: 'order-abc-12345678',
  userId: 'user-1',
  status: 'processing',
  totalOre: 25800,
  createdAt: '2025-09-15T10:00:00.000Z',
  updatedAt: '2025-09-15T10:00:00.000Z',
  items: [
    {
      id: 'item-1',
      orderId: 'order-abc-12345678',
      productId: 'prod-1',
      variantId: null,
      quantity: 2,
      unitPriceOre: 12900,
      product: { id: 'prod-1', name: 'Ethiopia Yirgacheffe', slug: 'ethiopia', imageUrl: null },
      variant: null,
    },
  ],
};

function renderOrderCard(order = baseOrder) {
  return render(
    <MemoryRouter>
      <OrderCard order={order} />
    </MemoryRouter>
  );
}

describe('OrderCard', () => {
  it('renders the short order ID', () => {
    renderOrderCard();
    expect(screen.getByText(/12345678/i)).toBeInTheDocument();
  });

  it('renders the total price', () => {
    renderOrderCard();
    expect(screen.getByText('258 kr')).toBeInTheDocument();
  });

  it('renders the order status', () => {
    renderOrderCard();
    expect(screen.getByText('Processing')).toBeInTheDocument();
  });

  it('renders order date', () => {
    renderOrderCard();
    expect(screen.getByText(/September/i)).toBeInTheDocument();
  });

  it('renders product name in items list', () => {
    renderOrderCard();
    expect(screen.getByText('Ethiopia Yirgacheffe')).toBeInTheDocument();
  });

  it('renders quantity and unit price for item', () => {
    renderOrderCard();
    expect(screen.getByText(/2 × 129 kr/)).toBeInTheDocument();
  });

  it('has a View details link to the order page', () => {
    renderOrderCard();
    const link = screen.getByRole('link', { name: /view details/i });
    expect(link).toHaveAttribute('href', '/orders/order-abc-12345678');
  });

  it('renders delivered status badge correctly', () => {
    renderOrderCard({ ...baseOrder, status: 'delivered' });
    expect(screen.getByText('Delivered')).toBeInTheDocument();
  });

  it('renders placeholder when product has no image', () => {
    const { container } = renderOrderCard();
    const placeholder = container.querySelector('.font-serif');
    expect(placeholder).toBeInTheDocument();
  });
});
