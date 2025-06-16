import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('renders the title', () => {
    render(<EmptyState title="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<EmptyState title="Empty" description="No items found." />);
    expect(screen.getByText('No items found.')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    render(<EmptyState title="Empty" />);
    expect(screen.queryByText(/./)).toBeTruthy();
    expect(document.querySelector('p')).not.toBeInTheDocument();
  });

  it('renders action element when provided', () => {
    render(<EmptyState title="Empty" action={<button>Go shopping</button>} />);
    expect(screen.getByRole('button', { name: 'Go shopping' })).toBeInTheDocument();
  });

  it('does not render action wrapper when action is not provided', () => {
    const { container } = render(<EmptyState title="Empty" />);
    expect(container.querySelectorAll('button')).toHaveLength(0);
  });

  it('renders icon when provided', () => {
    render(<EmptyState title="Empty" icon={<span data-testid="test-icon">🛒</span>} />);
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('does not render icon wrapper when icon is not provided', () => {
    const { container } = render(<EmptyState title="Empty" />);
    const iconWrapper = container.querySelector('.mb-4');
    expect(iconWrapper).not.toBeInTheDocument();
  });

  it('renders all props together', () => {
    render(
      <EmptyState
        title="No orders"
        description="Your order history is empty."
        action={<a href="/products">Shop now</a>}
        icon={<span>📦</span>}
      />
    );
    expect(screen.getByText('No orders')).toBeInTheDocument();
    expect(screen.getByText('Your order history is empty.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Shop now' })).toBeInTheDocument();
  });
});
