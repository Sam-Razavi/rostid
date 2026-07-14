import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { fetchProduct } from '../api/products.api';
import { RoastBadge, Badge, StockBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { useAddToCart } from '../hooks/useCart';
import { useAuthStore } from '../store/authStore';
import { fadeIn, fadeUp, staggerContainer } from '../animations/variants';
import { RelatedProducts } from '../components/products/RelatedProducts';
import { ReviewList } from '../components/products/ReviewList';
import { AddReviewForm } from '../components/products/AddReviewForm';
import { fetchReviews } from '../api/reviews.api';
import { createSubscription } from '../api/subscriptions.api';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';

function formatPrice(ore: number) {
  return `${Math.round(ore / 100)} kr`;
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const addToCart = useAddToCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedGrind, setSelectedGrind] = useState<string | null>(null);
  const [purchaseMode, setPurchaseMode] = useState<'one-time' | 'subscribe'>('one-time');
  const [intervalDays, setIntervalDays] = useState(30);

  const { user } = useAuthStore();
  const { track } = useRecentlyViewed();

  const subscribeMutation = useMutation({
    mutationFn: createSubscription,
    onSuccess: (result) => {
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        toast.success('Subscription created!');
        navigate('/subscriptions');
      }
    },
    onError: () => toast.error('Failed to create subscription'),
  });

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProduct(slug!),
    enabled: !!slug,
  });

  useEffect(() => {
    if (product) {
      track({
        id: product.id,
        slug: product.slug,
        name: product.name,
        priceOre: product.priceOre,
        imageUrl: product.imageUrl,
      });
    }
  }, [product, track]);

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', slug],
    queryFn: () => fetchReviews(slug!),
    enabled: !!slug,
  });

  const hasReviewed = !!reviewsData?.reviews.some((r) => r.userId === user?.id);

  const hasVariants = (product?.variants?.length ?? 0) > 0;
  const uniqueSizes = hasVariants ? [...new Set(product!.variants!.map((v) => v.name))] : [];
  const selectedSizeName = product?.variants?.find((v) => v.id === selectedVariantId)?.name ?? null;
  const grindsForSize = selectedSizeName
    ? [
        ...new Set(
          product!
            .variants!.filter((v) => v.name === selectedSizeName && v.grind)
            .map((v) => v.grind!)
        ),
      ]
    : [];

  const selectedVariant =
    product?.variants?.find((v) => {
      if (!selectedVariantId) return false;
      const base = v.id === selectedVariantId;
      if (selectedGrind) return v.name === selectedSizeName && v.grind === selectedGrind;
      return base;
    }) ??
    (selectedVariantId ? product?.variants?.find((v) => v.id === selectedVariantId) : null) ??
    null;

  const displayPrice = selectedVariant ? selectedVariant.priceOre : (product?.priceOre ?? 0);
  const displayStock = selectedVariant ? selectedVariant.stock : (product?.stock ?? 0);

  async function handleAddToCart() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${slug}` } });
      return;
    }
    if (hasVariants && !selectedVariantId) return;
    await addToCart.mutateAsync({
      productId: product!.id,
      quantity,
      variantId: selectedVariantId ?? undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (isLoading) {
    return (
      <div className="container-page py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container-page py-24 text-center">
        <p className="font-serif text-2xl text-stone-400 mb-4">Product not found</p>
        <Link to="/products" className="btn-primary inline-flex">
          ← Back to shop
        </Link>
      </div>
    );
  }

  const description = product.tastingNotes
    ? `${product.tastingNotes}. ${product.origin ? `Origin: ${product.origin}.` : ''}`.trim()
    : product.description.slice(0, 160);

  return (
    <>
      <Helmet>
        <title>{product.name} — Rostid</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={`${product.name} — Rostid`} />
        <meta property="og:description" content={description} />
        {product.imageUrl && <meta property="og:image" content={product.imageUrl} />}
        <meta property="og:type" content="product" />
        <meta property="og:site_name" content="Rostid" />
        <meta property="product:price:amount" content={String(product.priceOre / 100)} />
        <meta property="product:price:currency" content="SEK" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.description,
            image: product.imageUrl ?? undefined,
            sku: product.id,
            url: `${window.location.origin}/products/${product.slug}`,
            brand: { '@type': 'Brand', name: 'Rostid' },
            category: product.category.name,
            ...(product.origin ? { countryOfOrigin: product.origin } : {}),
            ...(product.weightGrams
              ? {
                  weight: {
                    '@type': 'QuantitativeValue',
                    value: product.weightGrams,
                    unitCode: 'GRM',
                  },
                }
              : {}),
            ...(reviewsData?.avgRating
              ? {
                  aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: reviewsData.avgRating,
                    reviewCount: reviewsData.count,
                    bestRating: 5,
                    worstRating: 1,
                  },
                }
              : {}),
            offers: {
              '@type': 'Offer',
              priceCurrency: 'SEK',
              price: product.priceOre / 100,
              availability:
                product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              seller: { '@type': 'Organization', name: 'Rostid' },
            },
          })}
        </script>
      </Helmet>
      <div className="container-page py-12">
        <nav className="text-sm text-stone-500 mb-8 flex items-center gap-2">
          <Link to="/products" className="hover:text-stone-900 transition-colors">
            Coffee
          </Link>
          <span>/</span>
          <Link
            to={`/products?category=${product.category.slug}`}
            className="hover:text-stone-900 transition-colors"
          >
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-stone-900">{product.name}</span>
          <button
            onClick={() => {
              navigator.clipboard
                .writeText(window.location.href)
                .then(() => {
                  toast.success('Link copied!');
                })
                .catch(() => toast.error('Failed to copy link'));
            }}
            aria-label="Copy link"
            className="ml-auto p-2 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer rounded-lg hover:bg-stone-100"
            title="Copy link"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </button>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Product image */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="aspect-square rounded-xl overflow-hidden bg-espresso-50"
          >
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="font-serif text-8xl text-espresso-200">R</span>
              </div>
            )}
          </motion.div>

          {/* Product info */}
          <motion.div
            className="flex flex-col"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp} className="flex items-start gap-3 mb-3">
              <Badge variant="brand">{product.category.name}</Badge>
              {product.roastLevel && <RoastBadge level={product.roastLevel} />}
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-serif text-4xl font-semibold text-stone-900 mb-2"
            >
              {product.name}
            </motion.h1>

            {product.origin && (
              <motion.p
                variants={fadeUp}
                className="text-sm text-stone-500 font-medium uppercase tracking-wide mb-4"
              >
                {product.origin}
              </motion.p>
            )}

            {product.tastingNotes && (
              <motion.p variants={fadeUp} className="text-stone-600 italic mb-6 text-lg">
                "{product.tastingNotes}"
              </motion.p>
            )}

            <motion.p variants={fadeUp} className="text-stone-600 leading-relaxed mb-8">
              {product.description}
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 mb-8 text-sm">
              {product.weightGrams && (
                <div className="bg-stone-50 rounded-lg px-4 py-3">
                  <p className="text-stone-500 text-xs uppercase tracking-wide">Weight</p>
                  <p className="font-semibold text-stone-900 mt-0.5">
                    {product.weightGrams >= 1000
                      ? `${product.weightGrams / 1000} kg`
                      : `${product.weightGrams}g`}
                  </p>
                </div>
              )}
              <div className="bg-stone-50 rounded-lg px-4 py-3">
                <p className="text-stone-500 text-xs uppercase tracking-wide mb-1">Availability</p>
                <StockBadge stock={product.stock} />
              </div>
            </motion.div>

            {hasVariants && (
              <motion.div variants={fadeUp} className="mb-6 space-y-4">
                <div>
                  <p className="text-sm font-medium text-stone-700 mb-2">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {uniqueSizes.map((sizeName) => {
                      const firstVariantForSize = product.variants!.find(
                        (v) => v.name === sizeName
                      )!;
                      const isSelected = selectedSizeName === sizeName;
                      return (
                        <button
                          key={sizeName}
                          onClick={() => {
                            setSelectedVariantId(firstVariantForSize.id);
                            setSelectedGrind(null);
                          }}
                          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                            isSelected
                              ? 'border-espresso-800 bg-espresso-800 text-white'
                              : 'border-stone-300 text-stone-700 hover:border-espresso-600'
                          }`}
                        >
                          {sizeName}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {grindsForSize.length > 0 && selectedSizeName && (
                  <div>
                    <p className="text-sm font-medium text-stone-700 mb-2">Grind</p>
                    <select
                      value={selectedGrind ?? ''}
                      onChange={(e) => {
                        const grind = e.target.value;
                        setSelectedGrind(grind || null);
                        const match = product.variants!.find(
                          (v) => v.name === selectedSizeName && v.grind === grind
                        );
                        if (match) setSelectedVariantId(match.id);
                      }}
                      className="w-full max-w-xs px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-espresso-500"
                    >
                      <option value="">Select grind</option>
                      {grindsForSize.map((g) => (
                        <option key={g} value={g}>
                          {g.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </motion.div>
            )}

            <motion.div variants={fadeUp} className="flex items-center gap-6 mb-6">
              <p className="font-serif text-3xl font-semibold text-espresso-800">
                {formatPrice(displayPrice)}
              </p>
              {hasVariants && !selectedVariantId && (
                <span className="text-sm text-stone-500">Select a size</span>
              )}
            </motion.div>

            {/* Purchase mode toggle */}
            <motion.div variants={fadeUp} className="mb-5">
              <div className="flex rounded-lg border border-stone-200 overflow-hidden">
                <button
                  onClick={() => setPurchaseMode('one-time')}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors cursor-pointer ${purchaseMode === 'one-time' ? 'bg-espresso-800 text-white' : 'text-stone-600 hover:bg-stone-50'}`}
                >
                  One-time
                </button>
                <button
                  onClick={() => setPurchaseMode('subscribe')}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors cursor-pointer ${purchaseMode === 'subscribe' ? 'bg-espresso-800 text-white' : 'text-stone-600 hover:bg-stone-50'}`}
                >
                  Subscribe & Save 10%
                </button>
              </div>
              {purchaseMode === 'subscribe' && (
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-sm text-stone-600">Deliver every</span>
                  {[14, 30, 60].map((d) => (
                    <button
                      key={d}
                      onClick={() => setIntervalDays(d)}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-medium cursor-pointer transition-colors ${intervalDays === d ? 'border-espresso-800 bg-espresso-50 text-espresso-800' : 'border-stone-200 text-stone-600 hover:border-stone-400'}`}
                    >
                      {d} days
                    </button>
                  ))}
                </div>
              )}
              {purchaseMode === 'subscribe' && (
                <p className="text-xs text-green-700 mt-2">
                  Subscribed price: <strong>{Math.round((displayPrice * 0.9) / 100)} kr</strong> —
                  save {Math.round((displayPrice * 0.1) / 100)} kr per delivery
                </p>
              )}
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4">
              {purchaseMode === 'one-time' && (
                <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="px-4 py-3 min-h-[44px] text-stone-600 hover:bg-stone-50 cursor-pointer transition-colors font-semibold"
                  >
                    −
                  </button>
                  <span className="px-4 py-3 text-stone-900 font-medium min-w-[3rem] text-center tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(displayStock, q + 1))}
                    disabled={quantity >= displayStock}
                    aria-label="Increase quantity"
                    className="px-4 py-3 min-h-[44px] text-stone-600 hover:bg-stone-50 cursor-pointer transition-colors font-semibold disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              )}

              <motion.div className="flex-1" whileTap={{ scale: 0.97 }}>
                {purchaseMode === 'one-time' ? (
                  <Button
                    onClick={handleAddToCart}
                    loading={addToCart.isPending}
                    disabled={displayStock === 0 || (hasVariants && !selectedVariantId)}
                    size="lg"
                    className="w-full"
                  >
                    {added
                      ? 'Added to cart'
                      : displayStock === 0
                        ? 'Out of stock'
                        : hasVariants && !selectedVariantId
                          ? 'Select a size'
                          : 'Add to cart'}
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      if (!isAuthenticated) {
                        navigate('/login', { state: { from: `/products/${slug}` } });
                        return;
                      }
                      subscribeMutation.mutate({
                        productId: product!.id,
                        intervalDays,
                        variantId: selectedVariantId,
                      });
                    }}
                    loading={subscribeMutation.isPending}
                    disabled={displayStock === 0 || (hasVariants && !selectedVariantId)}
                    size="lg"
                    className="w-full"
                  >
                    {displayStock === 0 ? 'Out of stock' : 'Subscribe now'}
                  </Button>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Reviews */}
        <div className="mt-16 border-t border-stone-100 pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-4xl">
            <ReviewList
              reviews={reviewsData?.reviews ?? []}
              avgRating={reviewsData?.avgRating ?? null}
              count={reviewsData?.count ?? 0}
            />
            <div>
              <h3 className="font-serif text-xl font-semibold text-stone-900 mb-6">
                Write a review
              </h3>
              <AddReviewForm slug={slug!} hasReviewed={hasReviewed} />
            </div>
          </div>
        </div>

        <div className="mt-20 border-t border-stone-100">
          <RelatedProducts
            categorySlug={product.category.slug}
            excludeId={product.id}
            onAddToCart={handleAddToCart}
            addingId={addToCart.isPending ? product.id : null}
          />
        </div>
      </div>
    </>
  );
}
