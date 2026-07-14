import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-espresso-950 text-stone-300">
      <div className="container-page py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <p className="font-serif text-2xl font-semibold text-white mb-3">Rostid</p>
            <p className="text-sm leading-relaxed text-stone-400">
              Specialty coffee from Stockholm. Sourced with care, roasted with precision. Delivered
              to your door.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Shop</h3>
            <ul className="space-y-2">
              {[
                { to: '/products', label: 'All Coffee' },
                { to: '/products?category=single-origin', label: 'Single Origin' },
                { to: '/products?category=blends', label: 'Blends' },
                { to: '/products?category=equipment', label: 'Equipment' },
                { to: '/products?category=subscriptions', label: 'Subscriptions' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-stone-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Account
            </h3>
            <ul className="space-y-2">
              {[
                { to: '/login', label: 'Sign in' },
                { to: '/register', label: 'Create account' },
                { to: '/orders', label: 'My orders' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-stone-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone-500">
            &copy; {new Date().getFullYear()} Rostid. All rights reserved.
          </p>
          <p className="text-xs text-stone-600 italic">Rost + Tid — time for the perfect roast.</p>
        </div>
      </div>
    </footer>
  );
}
