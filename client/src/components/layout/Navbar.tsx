import { Link, NavLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { useCart } from '../../hooks/useCart';
import apiClient from '../../api/client';

export function Navbar() {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const { data: cart } = useCart();
  const navigate = useNavigate();

  const cartCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  async function handleLogout() {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      clearAuth();
      toast.success('Signed out');
      navigate('/');
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-200">
      <div className="container-page">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="font-serif text-2xl font-semibold text-espresso-950 tracking-tight">
            Rostid
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? 'text-espresso-800' : 'text-stone-600 hover:text-stone-900'}`
              }
            >
              Coffee
            </NavLink>
            <NavLink
              to="/products?category=equipment"
              className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
            >
              Equipment
            </NavLink>
            <NavLink
              to="/products?category=subscriptions"
              className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
            >
              Subscriptions
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <Link to="/cart" className="relative p-2 text-stone-600 hover:text-stone-900 cursor-pointer transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] flex items-center justify-center bg-espresso-800 text-white text-[10px] font-bold rounded-full px-1">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {user?.role === 'admin' && (
                  <Link to="/admin" className="text-sm font-medium text-espresso-700 hover:text-espresso-900 transition-colors">
                    Admin
                  </Link>
                )}
                <Link to="/orders" className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors hidden sm:block">
                  Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors">
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-2 rounded-lg">
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
