import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PaymentCancelPage from '../PaymentCancelPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <PaymentCancelPage />
    </MemoryRouter>
  );
}

describe('PaymentCancelPage', () => {
  it('renders payment cancelled heading', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /payment cancelled/i })).toBeInTheDocument();
  });

  it('reassures the user no charge was made', () => {
    renderPage();
    expect(screen.getByText(/no charge was made/i)).toBeInTheDocument();
  });

  it('renders link back to cart', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /return to cart/i })).toHaveAttribute('href', '/cart');
  });

  it('renders link to continue shopping', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /continue shopping/i })).toHaveAttribute('href', '/products');
  });
});
