import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton, ProductCardSkeleton, ProductGridSkeleton, OrderCardSkeleton } from '../Skeleton';

describe('Skeleton', () => {
  it('renders a div with animate-pulse', () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('animate-pulse');
  });

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="h-4 w-full" />);
    expect((container.firstChild as HTMLElement).className).toContain('h-4');
  });
});

describe('ProductCardSkeleton', () => {
  it('renders multiple skeleton elements', () => {
    const { container } = render(<ProductCardSkeleton />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(1);
  });

  it('includes an image placeholder area', () => {
    const { container } = render(<ProductCardSkeleton />);
    const aspectEl = container.querySelector('.aspect-\\[4\\/3\\]');
    expect(aspectEl).toBeInTheDocument();
  });
});

describe('ProductGridSkeleton', () => {
  it('renders the default count of 8 cards', () => {
    const { container } = render(<ProductGridSkeleton />);
    const cards = container.querySelectorAll('.card');
    expect(cards).toHaveLength(8);
  });

  it('renders a custom count of cards', () => {
    const { container } = render(<ProductGridSkeleton count={4} />);
    const cards = container.querySelectorAll('.card');
    expect(cards).toHaveLength(4);
  });
});

describe('OrderCardSkeleton', () => {
  it('renders as a card', () => {
    const { container } = render(<OrderCardSkeleton />);
    expect(container.querySelector('.card')).toBeInTheDocument();
  });

  it('renders multiple skeleton elements', () => {
    const { container } = render(<OrderCardSkeleton />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(2);
  });
});
