import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when loading is true', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows spinner when loading', () => {
    const { container } = render(<Button loading>Loading</Button>);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        No click
      </Button>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders as type button by default', () => {
    render(<Button>Submit</Button>);
    expect(screen.getByRole('button').getAttribute('type')).toBeNull();
  });

  it('accepts type=submit', () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole('button').getAttribute('type')).toBe('submit');
  });

  it('applies custom className', () => {
    const { container } = render(<Button className="my-class">Test</Button>);
    expect(container.querySelector('.my-class')).toBeInTheDocument();
  });
});
