import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorMessage } from '../ErrorMessage';

describe('ErrorMessage', () => {
  it('renders default message when no message prop provided', () => {
    render(<ErrorMessage />);
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('renders custom message', () => {
    render(<ErrorMessage message="Failed to load products." />);
    expect(screen.getByText('Failed to load products.')).toBeInTheDocument();
  });

  it('does not render retry button when onRetry not provided', () => {
    render(<ErrorMessage />);
    expect(screen.queryByText(/try again/i)).toBeNull();
  });

  it('renders retry button when onRetry is provided', () => {
    render(<ErrorMessage onRetry={vi.fn()} />);
    expect(screen.getByText(/try again/i)).toBeInTheDocument();
  });

  it('calls onRetry when Try again is clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorMessage onRetry={onRetry} />);
    fireEvent.click(screen.getByText(/try again/i));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
