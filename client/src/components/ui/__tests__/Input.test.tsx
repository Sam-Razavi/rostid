import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../Input';

describe('Input', () => {
  it('renders without label or error', () => {
    const { container } = render(<Input placeholder="Enter text" />);
    expect(container.querySelector('input')).toBeInTheDocument();
    expect(container.querySelector('label')).not.toBeInTheDocument();
  });

  it('renders a label when label prop is provided', () => {
    render(<Input label="Email address" />);
    expect(screen.getByText('Email address')).toBeInTheDocument();
  });

  it('associates label with input via htmlFor', () => {
    render(<Input label="Email address" />);
    const label = screen.getByText('Email address');
    const input = screen.getByRole('textbox');
    expect(label.getAttribute('for')).toBe(input.id);
  });

  it('renders an error message when error prop is provided', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('applies error styling when error is present', () => {
    const { container } = render(<Input error="Bad input" />);
    const input = container.querySelector('input')!;
    expect(input.className).toContain('border-red-400');
  });

  it('renders placeholder text', () => {
    render(<Input placeholder="Type here..." />);
    expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument();
  });

  it('calls onChange when user types', () => {
    const onChange = vi.fn();
    render(<Input onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hello' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('passes through type prop', () => {
    const { container } = render(<Input type="email" />);
    expect(container.querySelector('input')?.type).toBe('email');
  });

  it('passes through required prop', () => {
    const { container } = render(<Input required />);
    expect(container.querySelector('input')?.required).toBe(true);
  });

  it('applies custom className', () => {
    const { container } = render(<Input className="my-custom-class" />);
    expect(container.querySelector('input')?.className).toContain('my-custom-class');
  });

  it('uses provided id instead of label-derived id', () => {
    render(<Input id="custom-id" label="My Label" />);
    expect(screen.getByRole('textbox').id).toBe('custom-id');
  });
});
