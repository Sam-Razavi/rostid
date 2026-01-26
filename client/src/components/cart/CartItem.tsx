import { Link } from 'react-router-dom';
import { useUpdateCartItem, useRemoveCartItem } from '../../hooks/useCart';
import type { CartItem as CartItemType } from '../../types';

function formatPrice(ore: number) {
  return `${Math.round(ore / 100)} kr`;
}

export function CartItem({ item }: { item: CartItemType }) {
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  const lineTotal = item.product.priceOre * item.quantity;

  return (
    <div className="flex gap-4 py-5 border-b border-stone-100 last:border-0">
      <Link to={`/products/${item.product.slug}`} className="shrink-0">
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-brand-50">
          {item.product.imageUrl ? (
            <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-serif text-xl text-brand-200">R</span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex-1 min-w-0">
        <Link to={`/products/${item.product.slug}`}>
          <h3 className="font-medium text-stone-900 hover:text-brand-800 transition-colors truncate">
            {item.product.name}
          </h3>
        </Link>
        <p className="text-sm text-stone-500 mt-0.5">
          {formatPrice(item.product.priceOre)} each
        </p>

        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden text-sm">
            <button
              onClick={() => {
                if (item.quantity === 1) removeItem.mutate(item.id);
                else updateItem.mutate({ id: item.id, quantity: item.quantity - 1 });
              }}
              disabled={updateItem.isPending || removeItem.isPending}
              className="px-3 py-1.5 text-stone-600 hover:bg-stone-50 cursor-pointer transition-colors disabled:opacity-40"
            >
              −
            </button>
            <span className="px-3 py-1.5 font-medium text-stone-900 min-w-[2rem] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => updateItem.mutate({ id: item.id, quantity: item.quantity + 1 })}
              disabled={item.quantity >= item.product.stock || updateItem.isPending}
              className="px-3 py-1.5 text-stone-600 hover:bg-stone-50 cursor-pointer transition-colors disabled:opacity-40"
            >
              +
            </button>
          </div>

          <button
            onClick={() => removeItem.mutate(item.id)}
            disabled={removeItem.isPending}
            className="text-sm text-stone-400 hover:text-red-500 cursor-pointer transition-colors ml-auto"
          >
            Remove
          </button>
        </div>
      </div>

      <div className="text-right shrink-0">
        <p className="font-semibold text-stone-900">{formatPrice(lineTotal)}</p>
      </div>
    </div>
  );
}
