import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Footer } from '../Footer';

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  );
}

describe('Footer', () => {
  it('renders the brand name', () => {
    renderFooter();
    expect(screen.getByText('Rostid')).toBeInTheDocument();
  });

  it('renders shop navigation links', () => {
    renderFooter();
    expect(screen.getByRole('link', { name: 'All Coffee' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Single Origin' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Blends' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Equipment' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Subscriptions' })).toBeInTheDocument();
  });

  it('renders account navigation links', () => {
    renderFooter();
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Create account' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'My orders' })).toBeInTheDocument();
  });

  it('links to correct hrefs', () => {
    renderFooter();
    expect(screen.getByRole('link', { name: 'All Coffee' })).toHaveAttribute('href', '/products');
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: 'My orders' })).toHaveAttribute('href', '/orders');
  });

  it('renders copyright with current year', () => {
    renderFooter();
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
  });

  it('renders the brand tagline', () => {
    renderFooter();
    expect(screen.getByText(/Rost \+ Tid/i)).toBeInTheDocument();
  });
});
