import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CookieBanner } from '../CookieBanner';

const STORAGE_KEY = 'rostid_cookie_consent';

beforeEach(() => {
  localStorage.clear();
});

describe('CookieBanner', () => {
  it('renders when no consent is stored', () => {
    render(<CookieBanner />);
    expect(screen.getByRole('dialog', { name: /cookie consent/i })).toBeInTheDocument();
  });

  it('does not render when consent is already stored', () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    render(<CookieBanner />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows "Accept all" and "Decline" buttons', () => {
    render(<CookieBanner />);
    expect(screen.getByRole('button', { name: 'Accept all' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Decline' })).toBeInTheDocument();
  });

  it('sets localStorage to "accepted" when Accept all is clicked', () => {
    render(<CookieBanner />);
    fireEvent.click(screen.getByRole('button', { name: 'Accept all' }));
    expect(localStorage.getItem(STORAGE_KEY)).toBe('accepted');
  });

  it('sets localStorage to "declined" when Decline is clicked', () => {
    render(<CookieBanner />);
    fireEvent.click(screen.getByRole('button', { name: 'Decline' }));
    expect(localStorage.getItem(STORAGE_KEY)).toBe('declined');
  });

  it('hides after accept is clicked', () => {
    render(<CookieBanner />);
    fireEvent.click(screen.getByRole('button', { name: 'Accept all' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('hides after decline is clicked', () => {
    render(<CookieBanner />);
    fireEvent.click(screen.getByRole('button', { name: 'Decline' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not render when consent is "declined"', () => {
    localStorage.setItem(STORAGE_KEY, 'declined');
    render(<CookieBanner />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
