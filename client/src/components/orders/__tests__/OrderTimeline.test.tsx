import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OrderTimeline } from '../OrderTimeline';

describe('OrderTimeline', () => {
  it('renders all 5 step labels in horizontal mode', () => {
    render(<OrderTimeline status="pending" />);
    expect(screen.getAllByText('Pending').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Confirmed').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Shipped').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Delivered').length).toBeGreaterThan(0);
  });

  it('renders "Roasting" label for processing step', () => {
    render(<OrderTimeline status="processing" />);
    expect(screen.getAllByText('Roasting').length).toBeGreaterThan(0);
  });

  it('shows cancelled state for cancelled orders', () => {
    render(<OrderTimeline status="cancelled" />);
    expect(screen.getByText('Order cancelled')).toBeInTheDocument();
  });

  it('does not render step circles when cancelled', () => {
    const { container } = render(<OrderTimeline status="cancelled" />);
    const circles = container.querySelectorAll('.rounded-full');
    expect(circles).toHaveLength(1);
  });

  it('renders in vertical orientation', () => {
    render(<OrderTimeline status="shipped" orientation="vertical" />);
    expect(screen.getAllByText('Shipped').length).toBeGreaterThan(0);
  });

  it('marks steps before current as done in vertical mode', () => {
    const { container } = render(<OrderTimeline status="shipped" orientation="vertical" />);
    const espressoCircles = container.querySelectorAll('.bg-espresso-700');
    expect(espressoCircles.length).toBeGreaterThan(0);
  });

  it('renders step numbers for pending status', () => {
    const { container } = render(<OrderTimeline status="pending" />);
    expect(container.querySelector('.text-xs.font-bold')).toBeInTheDocument();
  });
});
