import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from '../Pagination';

describe('Pagination', () => {
  it('renders nothing when totalPages is 1', () => {
    const { container } = render(<Pagination page={1} totalPages={1} onPageChange={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when totalPages is 0', () => {
    const { container } = render(<Pagination page={1} totalPages={0} onPageChange={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders page buttons for small page counts', () => {
    render(<Pagination page={1} totalPages={5} onPageChange={vi.fn()} />);
    expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Page 5')).toBeInTheDocument();
  });

  it('calls onPageChange with next page when Next clicked', () => {
    const onChange = vi.fn();
    render(<Pagination page={2} totalPages={5} onPageChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Next page'));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('calls onPageChange with previous page when Prev clicked', () => {
    const onChange = vi.fn();
    render(<Pagination page={3} totalPages={5} onPageChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Previous page'));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('disables Prev button on first page', () => {
    render(<Pagination page={1} totalPages={5} onPageChange={vi.fn()} />);
    expect(screen.getByLabelText('Previous page')).toBeDisabled();
  });

  it('disables Next button on last page', () => {
    render(<Pagination page={5} totalPages={5} onPageChange={vi.fn()} />);
    expect(screen.getByLabelText('Next page')).toBeDisabled();
  });

  it('marks current page with aria-current="page"', () => {
    render(<Pagination page={3} totalPages={5} onPageChange={vi.fn()} />);
    const currentBtn = screen.getByLabelText('Page 3');
    expect(currentBtn.getAttribute('aria-current')).toBe('page');
  });

  it('other pages do not have aria-current', () => {
    render(<Pagination page={2} totalPages={5} onPageChange={vi.fn()} />);
    const btn = screen.getByLabelText('Page 1');
    expect(btn.getAttribute('aria-current')).toBeNull();
  });

  it('calls onPageChange when a page number is clicked', () => {
    const onChange = vi.fn();
    render(<Pagination page={1} totalPages={5} onPageChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Page 3'));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('shows both ellipses when on a middle page of large pagination', () => {
    render(<Pagination page={10} totalPages={20} onPageChange={vi.fn()} />);
    expect(screen.getAllByText('…')).toHaveLength(2);
    expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Page 9')).toBeInTheDocument();
    expect(screen.getByLabelText('Page 10')).toBeInTheDocument();
    expect(screen.getByLabelText('Page 11')).toBeInTheDocument();
    expect(screen.getByLabelText('Page 20')).toBeInTheDocument();
  });

  it('shows only trailing ellipsis when on page 1 of large pagination', () => {
    render(<Pagination page={1} totalPages={20} onPageChange={vi.fn()} />);
    expect(screen.getAllByText('…')).toHaveLength(1);
    expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Page 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Page 20')).toBeInTheDocument();
  });

  it('shows only leading ellipsis when on the last page of large pagination', () => {
    render(<Pagination page={20} totalPages={20} onPageChange={vi.fn()} />);
    expect(screen.getAllByText('…')).toHaveLength(1);
    expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Page 19')).toBeInTheDocument();
    expect(screen.getByLabelText('Page 20')).toBeInTheDocument();
  });
});
