import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PaymentSuccessPage from '../PaymentSuccessPage';

function renderPage(search = '') {
  return render(
    <MemoryRouter initialEntries={[`/payment/success${search}`]}>
      <Routes>
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PaymentSuccessPage', () => {
  it('renders order confirmed heading', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /order confirmed/i })).toBeInTheDocument();
  });

  it('renders confirmation message', () => {
    renderPage();
    expect(screen.getByText(/your coffee is on its way/i)).toBeInTheDocument();
  });

  it('shows session reference when session_id param is present', () => {
    renderPage('?session_id=cs_test_abc123456789');
    expect(screen.getByText(/ref:/i)).toBeInTheDocument();
    expect(screen.getByText(/456789/i)).toBeInTheDocument();
  });

  it('does not show reference line when session_id is absent', () => {
    renderPage();
    expect(screen.queryByText(/ref:/i)).toBeNull();
  });

  it('renders link to orders page', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /view your orders/i })).toHaveAttribute('href', '/orders');
  });

  it('renders link to continue shopping', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /continue shopping/i })).toHaveAttribute('href', '/products');
  });
});
