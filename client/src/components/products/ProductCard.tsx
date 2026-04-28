import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RoastBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { addToWishlist, removeFromWishlist } from '../../api/wishlist.api';
import { useAuthStore } from '../../store/authStore';
import type { Product } from '../../types';
import { fadeUp } from '../../animations/variants';

function formatPrice(ore: number) {
  return `${Math.round(ore / 100)} kr`;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  addingId?: string | null;
  wishlisted?: boolean;
}

const NEW_THRESHOLD_DAYS = 14;

function getProductBadge(product: Product): { label: string; className: string } | null {
  const ageMs = Date.now() - new Date(product.createdAt).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  if (ageDays < NEW_THRESHOLD_DAYS) return { label: 'New', className: 'bg-espresso-100 text-espresso-800 border-espresso-200' };
  if (product.avgRating != null && product.avgRating >= 4.5) return { label: 'Popular', className: 'bg-amber-50 text-amber-700 border-amber-200' };
  return null;
}

export function ProductCard({ product, onAddToCart, addingId, wishlisted }: ProductCardProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();
  const badge = getProductBadge(product);

  const wishlistMutation = useMutation({
    mutationFn: wishlisted
      ? () => removeFromWishlist(product.id)
      : () => addToWishlist(product.id).then(() => undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  });

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
      className="card overflow-hidden group hover:shadow-card transition-shadow duration-200"
    >
      <Link to={`/products/${product.slug}`} className="block">
        <div className="aspect-[4/3] bg-stone-100 overflow-hidden relative">
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider bg-white px-3 py-1 rounded-full border border-stone-200">
                Out of stock
              </span>
            </div>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <div className="absolute top-2 left-2 z-10">
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Only {product.stock} left
              </span>
            </div>
          )}
          {product.stock > 5 && badge && (
            <div className="absolute top-2 left-2 z-10">
              <span className={`text-xs font-semibold border px-2 py-0.5 rounded-full ${badge.className}`}>
                {badge.label}
              </span>
            </div>
          )}
          {isAuthenticated && (
            <button
              onClick={(e) => { e.preventDefault(); wishlistMutation.mutate(); }}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <svg
                className={`w-4 h-4 transition-colors ${wishlisted ? 'text-red-500 fill-current' : 'text-stone-400 hover:text-red-400'}`}
                fill={wishlisted ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-espresso-50">
              <span className="font-serif text-4xl text-espresso-200">R</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/products/${product.slug}`}>
            <h3 className="font-semibold text-stone-900 hover:text-espresso-800 transition-colors leading-snug">
              {product.name}
            </h3>
          </Link>
          {product.roastLevel && <RoastBadge level={product.roastLevel} />}
        </div>

        {product.origin && (
          <p className="text-xs text-stone-500 font-medium uppercase tracking-wide">
            {product.origin}
          </p>
        )}

        {product.tastingNotes && (
          <p className="text-sm text-stone-500 italic line-clamp-1">{product.tastingNotes}</p>
        )}

        <div className="flex items-center justify-between pt-2">
          <p className="font-serif text-lg font-semibold text-espresso-800">
            {formatPrice(product.priceOre)}
          </p>

          {onAddToCart && (
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                onClick={() => onAddToCart(product)}
                disabled={product.stock === 0}
                loading={addingId === product.id}
              >
                {product.stock === 0 ? 'Unavailable' : 'Add to cart'}
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
