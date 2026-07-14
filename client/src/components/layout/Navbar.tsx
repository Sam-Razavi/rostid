import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { useCart } from '../../hooks/useCart';
import { useQuery } from '@tanstack/react-query';
import { fetchWishlist } from '../../api/wishlist.api';
import apiClient from '../../api/client';

export function Navbar() {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const { data: cart } = useCart();
  const { data: wishlistItems } = useQuery({
    queryKey: ['wishlist'],
    queryFn: fetchWishlist,
    enabled: isAuthenticated,
  });
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const cartCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const wishlistCount = wishlistItems?.length ?? 0;

  async function handleLogout() {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      clearAuth();
      setDrawerOpen(false);
      toast.success('Signed out');
      navigate('/');
    }
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-espresso-800' : 'text-stone-600 hover:text-stone-900'}`;

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-200">
        <div className="container-page">
          <div className="flex h-16 items-center justify-between">
            <Link
              to="/"
              className="font-serif text-2xl font-semibold text-espresso-950 tracking-tight"
            >
              Rostid
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              <NavLink to="/products" className={navLinkClass}>
                Coffee
              </NavLink>
              <NavLink
                to="/products?category=equipment"
                className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
              >
                Equipment
              </NavLink>
              {isAuthenticated && (
                <NavLink
                  to="/subscriptions"
                  className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
                >
                  Subscriptions
                </NavLink>
              )}
            </nav>

            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <Link
                  to="/wishlist"
                  aria-label="Wishlist"
                  className="relative p-2 text-stone-600 hover:text-stone-900 cursor-pointer transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                </Link>
              )}
              {isAuthenticated && (
                <Link
                  to="/cart"
                  aria-label="Shopping cart"
                  className="relative p-2 text-stone-600 hover:text-stone-900 cursor-pointer transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                    />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] flex items-center justify-center bg-espresso-800 text-white text-[10px] font-bold rounded-full px-1">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Desktop auth */}
              <div className="hidden md:flex items-center gap-2">
                {isAuthenticated ? (
                  <>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="text-sm font-medium text-espresso-700 hover:text-espresso-900 transition-colors"
                      >
                        Admin
                      </Link>
                    )}
                    <Link
                      to="/orders"
                      className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
                    >
                      Orders
                    </Link>
                    <Link
                      to="/profile"
                      className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors cursor-pointer min-h-[44px] px-2"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/register"
                      className="btn-primary text-sm px-4 py-2 rounded-lg min-h-[44px]"
                    >
                      Get started
                    </Link>
                  </>
                )}
              </div>

              {/* Hamburger — mobile only */}
              <button
                onClick={() => setDrawerOpen(true)}
                aria-label="Open menu"
                className="md:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/40"
              onClick={() => setDrawerOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed top-0 right-0 h-full z-50 w-72 bg-white shadow-warm flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
                <span className="font-serif text-xl font-semibold text-espresso-950">Menu</span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close menu"
                  className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <nav className="flex flex-col px-6 py-6 gap-1 flex-1">
                {[
                  { to: '/products', label: 'Coffee' },
                  { to: '/products?category=equipment', label: 'Equipment' },
                  { to: '/products?category=subscriptions', label: 'Subscriptions' },
                ].map(({ to, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setDrawerOpen(false)}
                    className={({ isActive }) =>
                      `px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                        isActive
                          ? 'bg-espresso-50 text-espresso-800'
                          : 'text-stone-700 hover:bg-stone-50'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                ))}

                <div className="border-t border-stone-100 my-4" />

                {isAuthenticated ? (
                  <>
                    <NavLink
                      to="/orders"
                      onClick={() => setDrawerOpen(false)}
                      className={({ isActive }) =>
                        `px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                          isActive
                            ? 'bg-espresso-50 text-espresso-800'
                            : 'text-stone-700 hover:bg-stone-50'
                        }`
                      }
                    >
                      My Orders
                    </NavLink>
                    <NavLink
                      to="/profile"
                      onClick={() => setDrawerOpen(false)}
                      className={({ isActive }) =>
                        `px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                          isActive
                            ? 'bg-espresso-50 text-espresso-800'
                            : 'text-stone-700 hover:bg-stone-50'
                        }`
                      }
                    >
                      My Profile
                    </NavLink>
                    {user?.role === 'admin' && (
                      <NavLink
                        to="/admin"
                        onClick={() => setDrawerOpen(false)}
                        className={({ isActive }) =>
                          `px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                            isActive
                              ? 'bg-espresso-50 text-espresso-800'
                              : 'text-stone-700 hover:bg-stone-50'
                          }`
                        }
                      >
                        Admin Dashboard
                      </NavLink>
                    )}
                    <button
                      onClick={handleLogout}
                      className="px-3 py-3 rounded-lg text-base font-medium text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer text-left mt-auto"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setDrawerOpen(false)}
                      className="px-3 py-3 rounded-lg text-base font-medium text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setDrawerOpen(false)}
                      className="btn-primary mt-2 text-center"
                    >
                      Get started
                    </Link>
                  </>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
