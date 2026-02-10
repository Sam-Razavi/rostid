import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RoastBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { Product } from '../../types';
import { fadeUp } from '../../animations/variants';

function formatPrice(ore: number) {
  return `${Math.round(ore / 100)} kr`;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  addingId?: string | null;
}

export function ProductCard({ product, onAddToCart, addingId }: ProductCardProps) {
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
