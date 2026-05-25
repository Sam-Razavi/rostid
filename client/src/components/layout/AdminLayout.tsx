import { Outlet, NavLink, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../api/client';
import { useNavigate } from 'react-router-dom';

export default function AdminLayout() {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      clearAuth();
      navigate('/');
    }
  }

  const navLinks = [
    { to: '/admin', label: 'Dashboard', end: true },
    { to: '/admin/products', label: 'Products', end: false },
    { to: '/admin/orders', label: 'Orders', end: false },
    { to: '/admin/customers', label: 'Customers', end: false },
    { to: '/admin/discounts', label: 'Discounts', end: false },
    { to: '/admin/subscriptions', label: 'Subscriptions', end: false },
    { to: '/admin/returns', label: 'Returns', end: false },
    { to: '/admin/gift-cards', label: 'Gift Cards', end: false },
  ];

  return (
    <div className="flex min-h-screen bg-stone-100">
      <aside className="w-64 bg-espresso-950 text-stone-300 flex flex-col" aria-label="Admin navigation">
        <div className="px-6 py-5 border-b border-stone-800">
          <Link to="/" className="font-serif text-xl font-semibold text-white">
            Rostid
          </Link>
          <p className="text-xs text-stone-500 mt-0.5">Admin Panel</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Admin menu">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-espresso-800 text-white'
                    : 'text-stone-400 hover:bg-stone-800 hover:text-white'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-stone-800">
          <Link
            to="/"
            className="flex items-center px-3 py-2.5 rounded-lg text-sm text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            ← View store
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer mt-1"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <main id="admin-main" className="flex-1 overflow-y-auto p-8" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
