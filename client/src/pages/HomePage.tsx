import { useState, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { fetchProducts } from '../api/products.api';
import { ProductCard } from '../components/products/ProductCard';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import { NewsletterSignup } from '../components/ui/NewsletterSignup';
import { useAddToCart } from '../hooks/useCart';
import { useAuthStore } from '../store/authStore';
import { staggerContainer, fadeUp } from '../animations/variants';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';

const FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
        />
      </svg>
    ),
    title: 'Direct sourcing',
    desc: 'Traceable to the farm',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
        />
      </svg>
    ),
    title: 'Small-batch roasting',
    desc: 'Roasted weekly in Stockholm',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
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
  const { getAll } = useRecentlyViewed();
  const recentlyViewed = useMemo(() => getAll(), [getAll]);

  const heroRef = useRef<HTMLElement>(null);
  const beanContainerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const beanScale = useTransform(scrollYProgress, [0, 1], [1, 0.72]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-160, 160], [14, -14]), {
    stiffness: 140,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(mouseX, [-160, 160], [-14, 14]), {
    stiffness: 140,
    damping: 22,
  });

  function handleBeanMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!beanContainerRef.current) return;
    const rect = beanContainerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - (rect.left + rect.width / 2));
    mouseY.set(e.clientY - (rect.top + rect.height / 2));
  }

  function handleBeanMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

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
      <section ref={heroRef} className="bg-espresso-950 text-white overflow-hidden">
        <div className="container-page py-16 sm:py-24 md:py-32">
          <motion.div
            className="grid items-center gap-12 md:grid-cols-2"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <div className="max-w-2xl">
              <motion.p
                variants={fadeUp}
                className="text-espresso-400 text-sm font-medium uppercase tracking-widest mb-4"
              >
                Stockholm, Sweden
              </motion.p>
              <motion.h1
                variants={fadeUp}
                className="font-serif text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight mb-6"
              >
                Time for the
                <br />
                <em className="not-italic text-espresso-400">perfect roast.</em>
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="text-stone-300 text-lg leading-relaxed mb-8 max-w-lg"
              >
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
            </div>

            <motion.div
              variants={fadeUp}
              className="flex justify-center md:justify-end"
              aria-hidden="true"
              style={{ scale: beanScale }}
            >
              <div
                ref={beanContainerRef}
                onMouseMove={handleBeanMouseMove}
                onMouseLeave={handleBeanMouseLeave}
                className="relative flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80"
                style={{ perspective: 900 }}
              >
                <motion.div
                  style={{ rotateX, rotateY }}
                  animate={{ y: [0, -14, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative flex items-center justify-center"
                >
                  <div className="absolute inset-8 rounded-full bg-espresso-900/40 blur-3xl" />
                  <motion.svg
                    viewBox="0 0 260 300"
                    className="relative h-[280px] w-[244px] text-espresso-400 drop-shadow-2xl"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  >
                    <defs>
                      <linearGradient
                        id="beanGradient"
                        x1="70"
                        y1="40"
                        x2="210"
                        y2="260"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop offset="0" stopColor="#C58B5B" />
                        <stop offset="0.45" stopColor="#9A5A31" />
                        <stop offset="1" stopColor="#5E3516" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M203.9 39.4c42.6 31.8 46.3 104 16.3 164.5-30 60.4-86.4 96.2-131.1 74.8-44.7-21.5-59.4-92.1-32.8-157.7 26.6-65.7 105-113.3 147.6-81.6Z"
                      fill="url(#beanGradient)"
                    />
                    <path
                      d="M161.8 48.6c-31.4 35.2-22.2 65.1-4.1 95 17.9 29.6 21.4 60.7-24.4 105.5"
                      fill="none"
                      stroke="#3B2111"
                      strokeWidth="16"
                      strokeLinecap="round"
                      opacity="0.72"
                    />
                    <path
                      d="M151.7 54.7c-20.6 33.8-10.2 58.9 6.9 86.8 18.7 30.5 23.3 57.7-13 96.9"
                      fill="none"
                      stroke="#E0B083"
                      strokeWidth="5"
                      strokeLinecap="round"
                      opacity="0.38"
                    />
                    <ellipse
                      cx="100"
                      cy="73"
                      rx="18"
                      ry="38"
                      fill="#E0B083"
                      opacity="0.12"
                      transform="rotate(31 100 73)"
                    />
                  </motion.svg>
                </motion.div>
              </div>
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
          <Link
            to="/products"
            className="text-sm font-medium text-espresso-700 hover:text-espresso-900 transition-colors"
          >
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
          <h2 className="font-serif text-4xl font-semibold mb-4">Never run out of good coffee.</h2>
          <p className="text-stone-400 text-lg mb-8 max-w-lg mx-auto">
            Subscribe and get freshly roasted single origins or espresso blends delivered monthly.
          </p>
          <Link
            to="/products?category=subscriptions"
            className="btn-primary px-8 py-4 text-base rounded-lg"
          >
            Explore subscriptions
          </Link>
        </div>
      </motion.section>

      {recentlyViewed.length > 0 && (
        <section className="container-page py-16">
          <h2 className="font-serif text-2xl font-semibold text-stone-900 mb-8">Recently viewed</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {recentlyViewed.map((item) => (
              <Link
                key={item.id}
                to={`/products/${item.slug}`}
                className="group card p-3 hover:shadow-md transition-shadow"
              >
                <div className="aspect-square bg-stone-100 rounded-lg overflow-hidden mb-3">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-serif text-3xl text-espresso-200">R</span>
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium text-stone-900 leading-snug truncate">
                  {item.name}
                </p>
                <p className="text-sm text-espresso-700 mt-0.5">
                  {Math.round(item.priceOre / 100)} kr
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <NewsletterSignup />
    </div>
  );
}
