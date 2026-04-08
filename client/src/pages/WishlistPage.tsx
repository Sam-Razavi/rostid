import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchWishlist, removeFromWishlist } from '../api/wishlist.api';
import { useAddToCart } from '../hooks/useCart';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { ErrorMessage } from '../components/ui/ErrorMessage';

function formatPrice(ore: number) {
  return `${Math.round(ore / 100)} kr`;
}

export default function WishlistPage() {
  const queryClient = useQueryClient();

  const { data: items, isLoading, isError, refetch } = useQuery({
    queryKey: ['wishlist'],
    queryFn: fetchWishlist,
  });

  const removeMutation = useMutation({
    mutationFn: removeFromWishlist,
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ['wishlist'] });
      const prev = queryClient.getQueryData(['wishlist']);
      queryClient.setQueryData(['wishlist'], (old: typeof items) =>
        old?.filter((i) => i.productId !== productId)
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['wishlist'], ctx?.prev);
      toast.error('Failed to remove from wishlist');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  });

  const { mutate: addToCart, isPending: addingToCart } = useAddToCart();

  if (isLoading) {
    return (
      <div className="container-page py-12">
        <h1 className="text-2xl font-semibold text-stone-900 mb-8">Wishlist</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (isError) return <div className="container-page py-16"><ErrorMessage onRetry={refetch} /></div>;

  return (
    <div className="container-page py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-stone-900">
          Wishlist
          {items && items.length > 0 && (
            <span className="ml-2 text-lg font-normal text-stone-400">({items.length})</span>
          )}
        </h1>
      </div>

      {items && items.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <p className="text-stone-500 mb-4">Your wishlist is empty</p>
          <Link to="/products" className="btn-primary">
            Browse coffees
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items?.map((item) => (
            <div key={item.id} className="card overflow-hidden group">
              <Link to={`/products/${item.product.slug}`} className="block">
                <div className="aspect-[4/3] bg-stone-100 overflow-hidden relative">
                  {item.product.stock === 0 && (
                    <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
                      <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider bg-white px-3 py-1 rounded-full border border-stone-200">
                        Out of stock
                      </span>
                    </div>
                  )}
                  {item.product.imageUrl ? (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-espresso-50">
                      <span className="font-serif text-4xl text-espresso-200">R</span>
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <Link to={`/products/${item.product.slug}`}>
                    <h3 className="font-semibold text-stone-900 hover:text-espresso-800 transition-colors leading-snug">
                      {item.product.name}
                    </h3>
                  </Link>
                  <button
                    onClick={() => removeMutation.mutate(item.productId)}
                    aria-label="Remove from wishlist"
                    className="p-1 text-red-400 hover:text-red-600 transition-colors cursor-pointer flex-shrink-0"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <p className="font-serif text-lg font-semibold text-espresso-800">
                    {formatPrice(item.product.priceOre)}
                  </p>
                  <button
                    onClick={() => addToCart({ productId: item.productId, quantity: 1 })}
                    disabled={item.product.stock === 0 || addingToCart}
                    className="btn-primary text-xs px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
