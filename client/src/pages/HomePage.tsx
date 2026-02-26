import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { fetchProducts } from '../api/products.api';
import { ProductCard } from '../components/products/ProductCard';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import { useAddToCart } from '../hooks/useCart';
import { useAuthStore } from '../store/authStore';
import { staggerContainer, fadeUp } from '../animations/variants';

const FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
      </svg>
    ),
    title: 'Direct sourcing',
    desc: 'Traceable to the farm',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
      </svg>
    ),
    title: 'Small-batch roasting',
    desc: 'Roasted weekly in Stockholm',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    title: 'Free shipping',
    desc: 'On orders over 400 kr',
  },
];

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
      <section className="bg-espresso-950 text-white overflow-hidden">
        <div className="container-page py-16 sm:py-24 md:py-32">
          <motion.div
            className="max-w-2xl"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.p variants={fadeUp} className="text-espresso-400 text-sm font-medium uppercase tracking-widest mb-4">
              Stockholm, Sweden
            </motion.p>
            <motion.h1 variants={fadeUp} className="font-serif text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight mb-6">
              Time for the
              <br />
              <em className="not-italic text-espresso-400">perfect roast.</em>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-stone-300 text-lg leading-relaxed mb-8 max-w-lg">
              Specialty coffees sourced from the world's finest farms. Roasted in small batches in
              Stockholm. Delivered fresh to your door.
            </motion.p>
            <motion.div variants={fadeUp} className="flex items-center gap-4">
              <Link to="/products" className="btn-primary text-base px-8 py-4 rounded-lg">
                Shop coffee
              </Link>
              <Link
                to="/products?category=subscriptions"
                className="text-stone-300 hover:text-white font-medium transition-colors"
              >
                Subscriptions →
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-espresso-50 border-y border-espresso-100">
        <div className="container-page py-12">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {FEATURES.map((f) => (
              <motion.div key={f.title} variants={fadeUp} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-espresso-100 flex items-center justify-center text-espresso-700 flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="font-semibold text-stone-900">{f.title}</p>
                  <p className="text-sm text-stone-500 mt-0.5">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured products */}
      <section className="container-page py-20">
        <motion.div
          className="flex items-end justify-between mb-10"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <div>
            <h2 className="font-serif text-3xl font-semibold text-stone-900">New arrivals</h2>
            <p className="text-stone-500 mt-1">Fresh off the roaster</p>
          </div>
          <Link to="/products" className="text-sm font-medium text-espresso-700 hover:text-espresso-900 transition-colors">
            View all →
          </Link>
        </motion.div>

        {isLoading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {data?.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                addingId={addingId}
              />
            ))}
          </motion.div>
        )}
      </section>

      {/* CTA */}
      <motion.section
        className="bg-stone-900 text-white"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
      >
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
      </motion.section>
    </div>
  );
}
