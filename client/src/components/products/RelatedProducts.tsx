import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { fetchProducts } from '../../api/products.api';
import { ProductCard } from './ProductCard';
import { staggerContainer } from '../../animations/variants';

interface RelatedProductsProps {
  categorySlug: string;
  excludeId: string;
  onAddToCart: (product: { id: string }) => void;
  addingId?: string | null;
}

export function RelatedProducts({ categorySlug, excludeId, onAddToCart, addingId }: RelatedProductsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['products', 'related', categorySlug, excludeId],
    queryFn: () => fetchProducts({ category: categorySlug, exclude: excludeId, limit: 4 }),
    staleTime: 5 * 60 * 1000,
  });

  const products = data?.products ?? [];

  if (!isLoading && products.length === 0) return null;

  return (
    <section className="container-page pb-20">
      <h2 className="font-serif text-2xl font-semibold text-stone-900 mb-8">You might also like</h2>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-stone-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-stone-200 rounded w-3/4" />
                <div className="h-3 bg-stone-100 rounded w-1/2" />
                <div className="h-5 bg-stone-200 rounded w-1/3 mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              addingId={addingId}
            />
          ))}
        </motion.div>
      )}
    </section>
  );
}
