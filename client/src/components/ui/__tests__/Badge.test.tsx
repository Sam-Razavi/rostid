import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge, OrderStatusBadge, RoastBadge, StockBadge } from '../Badge';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Label</Badge>);
    expect(screen.getByText('Label')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Badge className="extra">Text</Badge>);
    expect(container.querySelector('.extra')).toBeInTheDocument();
  });
});

describe('OrderStatusBadge', () => {
  it.each([
    ['pending', 'Pending'],
    ['confirmed', 'Confirmed'],
    ['processing', 'Processing'],
    ['shipped', 'Shipped'],
    ['delivered', 'Delivered'],
    ['cancelled', 'Cancelled'],
  ] as const)('renders label for status %s', (status, label) => {
    render(<OrderStatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});

describe('RoastBadge', () => {
  it('renders Light Roast', () => {
    render(<RoastBadge level="light" />);
    expect(screen.getByText('Light Roast')).toBeInTheDocument();
  });

  it('renders Medium Roast', () => {
    render(<RoastBadge level="medium" />);
    expect(screen.getByText('Medium Roast')).toBeInTheDocument();
  });

  it('renders Dark Roast', () => {
    render(<RoastBadge level="dark" />);
    expect(screen.getByText('Dark Roast')).toBeInTheDocument();
  });
});

describe('StockBadge', () => {
  it('shows Out of stock when stock is 0', () => {
    render(<StockBadge stock={0} />);
    expect(screen.getByText('Out of stock')).toBeInTheDocument();
  });

  it('shows Only N left when stock is 1–5', () => {
    render(<StockBadge stock={3} />);
    expect(screen.getByText('Only 3 left')).toBeInTheDocument();
  });

  it('shows In stock when stock is above 5', () => {
    render(<StockBadge stock={10} />);
    expect(screen.getByText('In stock')).toBeInTheDocument();
  });
});
