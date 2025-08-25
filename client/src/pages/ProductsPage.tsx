import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchProducts } from '../api/products.api';
import { fetchWishlist } from '../api/wishlist.api';
import { ProductCard } from '../components/products/ProductCard';
import { ProductFilters } from '../components/products/ProductFilters';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import { useAddToCart } from '../hooks/useCart';
import { useAuthStore } from '../store/authStore';
import { staggerContainer } from '../animations/variants';
import { useDebounce } from '../hooks/useDebounce';
import { Pagination } from '../components/ui/Pagination';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();
  const addToCart = useAddToCart();
  const [addingId, setAddingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const category = searchParams.get('category') ?? '';
  const roast = searchParams.get('roast') ?? '';
  const sort = searchParams.get('sort') ?? 'newest';
  const searchParam = searchParams.get('search') ?? '';
  const minPriceParam = searchParams.get('minPrice') ?? '';
  const maxPriceParam = searchParams.get('maxPrice') ?? '';

  const [searchInput, setSearchInput] = useState(searchParam);
  const [minPrice, setMinPrice] = useState(minPriceParam);
  const [maxPrice, setMaxPrice] = useState(maxPriceParam);
  const debouncedSearch = useDebounce(searchInput, 300);
  const debouncedMin = useDebounce(minPrice, 400);
  const debouncedMax = useDebounce(maxPrice, 400);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (debouncedSearch) next.set('search', debouncedSearch);
    else next.delete('search');
    next.delete('page');
    setSearchParams(next, { replace: true });
    setPage(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (debouncedMin) next.set('minPrice', debouncedMin);
    else next.delete('minPrice');
    next.delete('page');
    setSearchParams(next, { replace: true });
    setPage(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedMin]);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (debouncedMax) next.set('maxPrice', debouncedMax);
    else next.delete('maxPrice');
    next.delete('page');
    setSearchParams(next, { replace: true });
    setPage(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedMax]);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
    setPage(1);
  }

  const minPriceVal = debouncedMin ? parseInt(debouncedMin, 10) : undefined;
  const maxPriceVal = debouncedMax ? parseInt(debouncedMax, 10) : undefined;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products', { category, roast, search: debouncedSearch, sort, page, minPriceVal, maxPriceVal }],
    queryFn: () => fetchProducts({ category, roast, search: debouncedSearch, sort, page, limit: 12, minPrice: minPriceVal, maxPrice: maxPriceVal }),
    placeholderData: (prev) => prev,
  });

  const { data: wishlistItems } = useQuery({
    queryKey: ['wishlist'],
    queryFn: fetchWishlist,
    enabled: isAuthenticated,
  });

  const wishlistedIds = new Set(wishlistItems?.map((i) => i.productId) ?? []);

  async function handleAddToCart(product: { id: string }) {
    if (!isAuthenticated) { navigate('/login'); return; }
    setAddingId(product.id);
    try {
      await addToCart.mutateAsync({ productId: product.id, quantity: 1 });
    } finally {
      setAddingId(null);
    }
  }

  return (
    <div className="container-page py-10">
      <Helmet>
        <title>Coffee shop — Rostid</title>
        <meta name="description" content="Specialty coffee roasted in Stockholm. Single origins, blends, and subscriptions — shipped fresh." />
      </Helmet>
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-semibold text-stone-900">Coffee shop</h1>
        <p className="text-stone-500 mt-2">
          {data ? `${data.pagination.total} coffees` : 'Loading…'}
        </p>
      </div>

      <div className="mb-6">
        <ProductFilters
          selectedCategory={category}
          selectedRoast={roast}
          search={searchInput}
          sort={sort}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onCategoryChange={(v) => updateParam('category', v)}
          onRoastChange={(v) => updateParam('roast', v)}
          onSearchChange={setSearchInput}
          onSortChange={(v) => updateParam('sort', v)}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
        />
      </div>

      {isLoading ? (
        <ProductGridSkeleton />
      ) : data?.products.length === 0 ? (
        <div className="text-center py-24">
          <p className="font-serif text-2xl text-stone-400 mb-2">No results found</p>
          <p className="text-stone-500">Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <>
          <motion.div
            key={`${category}-${roast}-${debouncedSearch}-${page}-${minPriceVal}-${maxPriceVal}`}
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-opacity ${isFetching ? 'opacity-60' : 'opacity-100'}`}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {data?.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                addingId={addingId}
                wishlisted={wishlistedIds.has(product.id)}
              />
            ))}
          </motion.div>

          {data && (
            <Pagination
              page={page}
              totalPages={data.pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
