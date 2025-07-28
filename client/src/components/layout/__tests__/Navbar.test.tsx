import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from '../Navbar';

vi.mock('../../../store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('../../../hooks/useCart', () => ({
  useCart: vi.fn(() => ({ data: null })),
}));

vi.mock('../../../api/wishlist.api', () => ({
  fetchWishlist: vi.fn(() => Promise.resolve([])),
}));

vi.mock('../../../api/client', () => ({
  default: { post: vi.fn(() => Promise.resolve({})) },
}));

import { useAuthStore } from '../../../store/authStore';

const mockUseAuthStore = useAuthStore as ReturnType<typeof vi.fn>;

function renderNavbar() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Rostid logo', () => {
    mockUseAuthStore.mockReturnValue({ user: null, isAuthenticated: false, clearAuth: vi.fn() });
    renderNavbar();
    expect(screen.getByText('Rostid')).toBeInTheDocument();
  });

  it('shows Sign in and Get started links for guest users', () => {
    mockUseAuthStore.mockReturnValue({ user: null, isAuthenticated: false, clearAuth: vi.fn() });
    renderNavbar();
    expect(screen.getByText('Sign in')).toBeInTheDocument();
    expect(screen.getByText('Get started')).toBeInTheDocument();
  });

  it('does not show Orders link for guest users', () => {
    mockUseAuthStore.mockReturnValue({ user: null, isAuthenticated: false, clearAuth: vi.fn() });
    renderNavbar();
    expect(screen.queryByText('Orders')).not.toBeInTheDocument();
  });

  it('shows Orders and Profile links for authenticated users', () => {
    mockUseAuthStore.mockReturnValue({
      user: { id: 'u1', name: 'Alice', email: 'alice@test.com', role: 'customer' },
      isAuthenticated: true,
      clearAuth: vi.fn(),
    });
    renderNavbar();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('does not show Sign in for authenticated users', () => {
    mockUseAuthStore.mockReturnValue({
      user: { id: 'u1', name: 'Alice', email: 'alice@test.com', role: 'customer' },
      isAuthenticated: true,
      clearAuth: vi.fn(),
    });
    renderNavbar();
    expect(screen.queryByText('Sign in')).not.toBeInTheDocument();
  });

  it('shows Admin link for admin users', () => {
    mockUseAuthStore.mockReturnValue({
      user: { id: 'u2', name: 'Boss', email: 'admin@test.com', role: 'admin' },
      isAuthenticated: true,
      clearAuth: vi.fn(),
    });
    renderNavbar();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('does not show Admin link for regular customers', () => {
    mockUseAuthStore.mockReturnValue({
      user: { id: 'u1', name: 'Alice', email: 'alice@test.com', role: 'customer' },
      isAuthenticated: true,
      clearAuth: vi.fn(),
    });
    renderNavbar();
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });
});
