import { useState, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { fetchProducts } from '../api/products.api';
import { ProductCard } from '../components/products/ProductCard';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import { NewsletterSignup } from '../components/ui/NewsletterSignup';
import { useAddToCart } from '../hooks/useCart';
import { useAuthStore } from '../store/authStore';
import {
  duration,
  ease,
  fadeIn,
  fadeUp,
  imageReveal,
  inView,
  lineGrow,
  maskReveal,
  staggerContainer,
  staggerSlow,
} from '../animations/variants';
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

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1200&auto=format&q=80';
const HERO_DETAIL_IMAGE =
  'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=600&auto=format&q=80';

const CTA_IMAGE =
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1000&auto=format&q=80';

const ORIGINS = ['Ethiopia', 'Kenya', 'Colombia', 'Guatemala', 'Brazil', 'Rwanda', 'Costa Rica'];

const STATS = [
  { value: 'Weekly', label: 'Fresh roasts' },
  { value: '10%', label: 'Subscriber savings' },
  { value: '3', label: 'Bag sizes' },
];

function HeadlineLine({ children }: { children: React.ReactNode }) {
  return (
    <span className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
      <motion.span variants={maskReveal} className="block">
        {children}
      </motion.span>
    </span>
  );
}

function OriginsMarquee() {
  const reduceMotion = useReducedMotion();
  const items = [...ORIGINS, ...ORIGINS];

  return (
    <div className="relative overflow-hidden border-t border-white/10 py-5" aria-hidden="true">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-espresso-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-espresso-950 to-transparent" />
      <motion.div
        className="flex w-max gap-12 whitespace-nowrap"
        animate={reduceMotion ? undefined : { x: ['0%', '-50%'] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      >
        {items.map((origin, i) => (
          <span
            key={`${origin}-${i}`}
            className="flex items-center gap-12 font-serif text-xl italic text-stone-400"
          >
            {origin}
            <span className="h-1 w-1 rounded-full bg-espresso-500" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function HomePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();
  const addToCart = useAddToCart();
  const [addingId, setAddingId] = useState<string | null>(null);
  const { getAll } = useRecentlyViewed();
  const recentlyViewed = useMemo(() => getAll(), [getAll]);
  const reduceMotion = useReducedMotion();

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', reduceMotion ? '0%' : '12%']);
  const detailY = useTransform(scrollYProgress, [0, 1], ['0%', reduceMotion ? '0%' : '-30%']);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.6], [1, reduceMotion ? 1 : 0.2]);

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
      <section ref={heroRef} className="relative overflow-hidden bg-espresso-950 text-white">
        <div className="pointer-events-none absolute -left-40 top-0 h-[36rem] w-[36rem] rounded-full bg-espresso-800/30 blur-[120px]" />

        <div className="container-page relative py-16 sm:py-20 lg:py-24">
          <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
            <motion.div
              className="lg:col-span-6"
              style={{ opacity: copyOpacity }}
              variants={staggerSlow}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={fadeIn} className="mb-6 flex items-center gap-4">
                <motion.span
                  variants={lineGrow}
                  className="block h-px w-10 origin-left bg-espresso-400"
                />
                <span className="text-xs font-medium uppercase tracking-[0.25em] text-espresso-300">
                  Roastery · Stockholm
                </span>
              </motion.div>

              <h1 className="mb-7 font-serif text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl xl:text-7xl">
                <HeadlineLine>Time for the</HeadlineLine>
                <HeadlineLine>
                  <em className="font-normal italic text-espresso-300">perfect roast.</em>
                </HeadlineLine>
              </h1>

              <motion.p
                variants={fadeUp}
                className="mb-10 max-w-md text-lg leading-relaxed text-stone-300"
              >
                Specialty coffees sourced from the world's finest farms. Roasted in small batches in
                Stockholm. Delivered fresh to your door.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-6">
                <Link
                  to="/products"
                  className="group inline-flex min-h-[52px] items-center gap-3 rounded-full bg-espresso-100 px-8 text-base font-medium text-espresso-950 transition-colors duration-300 hover:bg-white"
                >
                  Shop coffee
                  <span className="transition-transform duration-300 ease-out group-hover:translate-x-1">
                    →
                  </span>
                </Link>
                <Link
                  to="/products?category=subscriptions"
                  className="group relative font-medium text-stone-300 transition-colors hover:text-white"
                >
                  Explore subscriptions
                  <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300 ease-out group-hover:scale-x-100" />
                </Link>
              </motion.div>

              <motion.dl
                variants={fadeUp}
                className="mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-8"
              >
                {STATS.map((stat) => (
                  <div key={stat.label}>
                    <dt className="sr-only">{stat.label}</dt>
                    <dd className="font-serif text-3xl font-semibold text-white">{stat.value}</dd>
                    <dd className="mt-1 text-xs uppercase tracking-widest text-stone-400">
                      {stat.label}
                    </dd>
                  </div>
                ))}
              </motion.dl>
            </motion.div>

            <div className="relative lg:col-span-6" aria-hidden="true">
              <div className="relative ml-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] xl:max-w-[30rem]">
                <motion.div
                  className="absolute inset-0"
                  variants={imageReveal}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.img
                    src={HERO_IMAGE}
                    alt=""
                    className="h-[115%] w-full object-cover"
                    style={{ y: imageY }}
                    fetchPriority="high"
                  />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-espresso-950/70 via-transparent to-transparent" />
              </div>

              <motion.div
                className="absolute -left-6 bottom-16 hidden w-40 overflow-hidden rounded-2xl border-4 border-espresso-950 shadow-2xl sm:block lg:-left-12 xl:w-48"
                style={{ y: detailY }}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: duration.crawl, ease: ease.out }}
              >
                <img src={HERO_DETAIL_IMAGE} alt="" className="aspect-square w-full object-cover" />
              </motion.div>

              <motion.div
                className="absolute right-4 top-6 rounded-2xl border border-white/15 bg-espresso-950/60 px-5 py-4 backdrop-blur-md sm:right-6"
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: duration.slow, ease: ease.out }}
              >
                <p className="text-[11px] uppercase tracking-[0.2em] text-espresso-300">
                  This week&rsquo;s roast
                </p>
                <p className="mt-1 font-serif text-lg text-white">Ethiopia Yirgacheffe</p>
                <div className="mt-2 flex items-center gap-2 text-xs text-stone-300">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  Fresh batch shipping
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <OriginsMarquee />
      </section>

      {/* Features */}
      <section className="border-b border-espresso-100 bg-espresso-50">
        <motion.div
          className="container-page grid grid-cols-1 divide-y divide-espresso-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={inView}
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              className="group flex items-start gap-5 py-10 sm:px-8 sm:first:pl-0 sm:last:pr-0"
            >
              <span className="font-serif text-sm italic text-espresso-400">0{i + 1}</span>
              <div className="flex-1">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-espresso-200 text-espresso-700 transition-colors duration-300 group-hover:border-espresso-800 group-hover:bg-espresso-800 group-hover:text-espresso-50">
                  {f.icon}
                </div>
                <p className="font-semibold text-stone-900">{f.title}</p>
                <p className="mt-1 text-sm text-stone-500">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Featured products */}
      <section className="container-page py-24">
        <motion.div
          className="mb-12 flex items-end justify-between gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={inView}
        >
          <div>
            <motion.p
              variants={fadeUp}
              className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-espresso-600"
            >
              Fresh off the roaster
            </motion.p>
            <h2 className="font-serif text-4xl font-semibold tracking-tight text-stone-900">
              <HeadlineLine>New arrivals</HeadlineLine>
            </h2>
          </div>
          <motion.div variants={fadeUp}>
            <Link
              to="/products"
              className="group inline-flex items-center gap-2 text-sm font-medium text-espresso-700 transition-colors hover:text-espresso-900"
            >
              View all
              <span className="transition-transform duration-300 ease-out group-hover:translate-x-1">
                →
              </span>
            </Link>
          </motion.div>
        </motion.div>

        {isLoading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <motion.div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={inView}
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
      <section className="container-page pb-24">
        <motion.div
          className="relative grid overflow-hidden rounded-[2rem] bg-stone-900 text-white lg:grid-cols-2"
          variants={staggerSlow}
          initial="hidden"
          whileInView="visible"
          viewport={inView}
        >
          <div className="relative z-10 flex flex-col justify-center px-8 py-16 sm:px-14 lg:py-20">
            <motion.p
              variants={fadeUp}
              className="mb-4 text-xs font-medium uppercase tracking-[0.25em] text-espresso-300"
            >
              Subscribe &amp; save 10%
            </motion.p>
            <h2 className="mb-5 font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              <HeadlineLine>Never run out of</HeadlineLine>
              <HeadlineLine>
                <em className="font-normal italic text-espresso-300">good coffee.</em>
              </HeadlineLine>
            </h2>
            <motion.p variants={fadeUp} className="mb-10 max-w-md text-lg text-stone-400">
              Freshly roasted single origins or espresso blends, delivered every two weeks, monthly
              or every other month. Pause or cancel anytime.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                to="/products?category=subscriptions"
                className="group inline-flex min-h-[52px] items-center gap-3 rounded-full bg-espresso-100 px-8 text-base font-medium text-espresso-950 transition-colors duration-300 hover:bg-white"
              >
                Explore subscriptions
                <span className="transition-transform duration-300 ease-out group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </motion.div>
          </div>
          <div className="relative min-h-[18rem] overflow-hidden" aria-hidden="true">
            <motion.img
              src={CTA_IMAGE}
              alt=""
              loading="lazy"
              variants={imageReveal}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-900/20 to-transparent lg:via-transparent" />
          </div>
        </motion.div>
      </section>

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
