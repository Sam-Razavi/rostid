import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../api/products.api';
import { ProductCard } from '../components/products/ProductCard';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import { useAddToCart } from '../hooks/useCart';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function HomePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();
  const addToCart = useAddToCart();
  const [addingId, setAddingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => fetchProducts({ limit: 4, sort: 'newest' }),
  });

  async function handleAddToCart(product: { id: string }) {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setAddingId(product.id);
    try {
      await addToCart.mutateAsync({ productId: product.id, quantity: 1 });
    } finally {
      setAddingId(null);
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-brand-950 text-white">
        <div className="container-page py-24 md:py-32">
          <div className="max-w-2xl">
            <p className="text-brand-400 text-sm font-medium uppercase tracking-widest mb-4">
              Stockholm, Sweden
            </p>
            <h1 className="font-serif text-5xl md:text-6xl font-semibold leading-tight mb-6">
              Time for the
              <br />
              <em className="not-italic text-brand-400">perfect roast.</em>
            </h1>
            <p className="text-stone-300 text-lg leading-relaxed mb-8 max-w-lg">
              Specialty coffees sourced from the world's finest farms. Roasted in small batches in
              Stockholm. Delivered fresh to your door.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/products" className="btn-primary text-base px-8 py-4 rounded-lg">
                Shop coffee
              </Link>
              <Link
                to="/products?category=subscriptions"
                className="text-stone-300 hover:text-white font-medium transition-colors"
              >
                Subscriptions →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-brand-50 border-y border-brand-100">
        <div className="container-page py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: '🌍', title: 'Direct sourcing', desc: 'Traceable to the farm' },
              { icon: '🔥', title: 'Small-batch roasting', desc: 'Roasted weekly in Stockholm' },
              { icon: '📦', title: 'Free shipping', desc: 'On orders over 400 kr' },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <p className="font-semibold text-stone-900">{f.title}</p>
                  <p className="text-sm text-stone-500 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="container-page py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-serif text-3xl font-semibold text-stone-900">New arrivals</h2>
            <p className="text-stone-500 mt-1">Fresh off the roaster</p>
          </div>
          <Link to="/products" className="text-sm font-medium text-brand-700 hover:text-brand-900 transition-colors">
            View all →
          </Link>
        </div>

        {isLoading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data?.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                addingId={addingId}
              />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-stone-900 text-white">
        <div className="container-page py-20 text-center">
          <h2 className="font-serif text-4xl font-semibold mb-4">
            Never run out of good coffee.
          </h2>
          <p className="text-stone-400 text-lg mb-8 max-w-lg mx-auto">
            Subscribe and get freshly roasted single origins or espresso blends delivered monthly.
          </p>
          <Link to="/products?category=subscriptions" className="btn-primary px-8 py-4 text-base rounded-lg">
            Explore subscriptions
          </Link>
        </div>
      </section>
    </div>
  );
}
