import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
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

  const { user } = useAuthStore();

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProduct(slug!),
    enabled: !!slug,
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', slug],
    queryFn: () => fetchReviews(slug!),
    enabled: !!slug,
  });

  const hasReviewed = !!reviewsData?.reviews.some((r) => r.userId === user?.id);

  async function handleAddToCart() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${slug}` } });
      return;
    }
    await addToCart.mutateAsync({ productId: product!.id, quantity });
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
        <Link to="/products" className="btn-primary inline-flex">← Back to shop</Link>
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
    </Helmet>
    <div className="container-page py-12">
      <nav className="text-sm text-stone-500 mb-8 flex items-center gap-2">
        <Link to="/products" className="hover:text-stone-900 transition-colors">Coffee</Link>
        <span>/</span>
        <Link to={`/products?category=${product.category.slug}`} className="hover:text-stone-900 transition-colors">
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-stone-900">{product.name}</span>
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
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
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

          <motion.h1 variants={fadeUp} className="font-serif text-4xl font-semibold text-stone-900 mb-2">
            {product.name}
          </motion.h1>

          {product.origin && (
            <motion.p variants={fadeUp} className="text-sm text-stone-500 font-medium uppercase tracking-wide mb-4">
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

          <motion.div variants={fadeUp} className="flex items-center gap-6 mb-6">
            <p className="font-serif text-3xl font-semibold text-espresso-800">
              {formatPrice(product.priceOre)}
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4">
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
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                disabled={quantity >= product.stock}
                aria-label="Increase quantity"
                className="px-4 py-3 min-h-[44px] text-stone-600 hover:bg-stone-50 cursor-pointer transition-colors font-semibold disabled:opacity-40"
              >
                +
              </button>
            </div>

            <motion.div className="flex-1" whileTap={{ scale: 0.97 }}>
              <Button
                onClick={handleAddToCart}
                loading={addToCart.isPending}
                disabled={product.stock === 0}
                size="lg"
                className="w-full"
              >
                {added ? 'Added to cart' : product.stock === 0 ? 'Out of stock' : 'Add to cart'}
              </Button>
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
            <h3 className="font-serif text-xl font-semibold text-stone-900 mb-6">Write a review</h3>
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
