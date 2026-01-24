import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchProducts } from '../api/products.api';
import { ProductCard } from '../components/products/ProductCard';
import { ProductFilters } from '../components/products/ProductFilters';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import { useAddToCart } from '../hooks/useCart';
import { useAuthStore } from '../store/authStore';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();
  const addToCart = useAddToCart();
  const [addingId, setAddingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const category = searchParams.get('category') ?? '';
  const roast = searchParams.get('roast') ?? '';
  const search = searchParams.get('search') ?? '';
  const sort = searchParams.get('sort') ?? 'newest';

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
    setPage(1);
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products', { category, roast, search, sort, page }],
    queryFn: () => fetchProducts({ category, roast, search, sort, page, limit: 12 }),
    placeholderData: (prev) => prev,
  });

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
          search={search}
          sort={sort}
          onCategoryChange={(v) => updateParam('category', v)}
          onRoastChange={(v) => updateParam('roast', v)}
          onSearchChange={(v) => updateParam('search', v)}
          onSortChange={(v) => updateParam('sort', v)}
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
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-opacity ${isFetching ? 'opacity-60' : 'opacity-100'}`}>
            {data?.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                addingId={addingId}
              />
            ))}
          </div>

          {data && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className="btn-secondary text-sm px-4 py-2 rounded-lg disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-stone-500">
                Page {page} of {data.pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === data.pagination.totalPages}
                className="btn-secondary text-sm px-4 py-2 rounded-lg disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
