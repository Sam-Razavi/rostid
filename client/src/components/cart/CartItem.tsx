import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useUpdateCartItem, useRemoveCartItem } from '../../hooks/useCart';
import type { CartItem as CartItemType } from '../../types';

function formatPrice(ore: number) {
  return `${Math.round(ore / 100)} kr`;
}

export function CartItem({ item }: { item: CartItemType }) {
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  const unitPrice = item.variant?.priceOre ?? item.product.priceOre;
  const stockLimit = item.variant?.stock ?? item.product.stock;
  const lineTotal = unitPrice * item.quantity;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="flex gap-4 py-5 border-b border-stone-100 last:border-0 overflow-hidden"
    >
      <Link to={`/products/${item.product.slug}`} className="shrink-0">
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-espresso-50">
          {item.product.imageUrl ? (
            <img
              src={item.product.imageUrl}
              alt={item.product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-serif text-xl text-espresso-200">R</span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex-1 min-w-0">
        <Link to={`/products/${item.product.slug}`}>
          <h3 className="font-medium text-stone-900 hover:text-espresso-800 transition-colors truncate">
            {item.product.name}
          </h3>
        </Link>
        {item.variant && (
          <p className="text-xs text-stone-400 mt-0.5">
            {item.variant.name}
            {item.variant.grind ? ` · ${item.variant.grind.replace('_', ' ')}` : ''}
          </p>
        )}
        <p className="text-sm text-stone-500 mt-0.5">{formatPrice(unitPrice)} each</p>

        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden text-sm">
            <button
              onClick={() => {
                if (item.quantity === 1) removeItem.mutate(item.id);
                else updateItem.mutate({ id: item.id, quantity: item.quantity - 1 });
              }}
              disabled={updateItem.isPending || removeItem.isPending}
              aria-label="Decrease quantity"
              className="px-3 py-1.5 min-h-[44px] text-stone-600 hover:bg-stone-50 cursor-pointer transition-colors disabled:opacity-40"
            >
              −
            </button>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={item.quantity}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
                className="px-3 py-1.5 font-medium text-stone-900 min-w-[2rem] text-center tabular-nums"
              >
                {item.quantity}
              </motion.span>
            </AnimatePresence>
            <button
              onClick={() => updateItem.mutate({ id: item.id, quantity: item.quantity + 1 })}
              disabled={item.quantity >= stockLimit || updateItem.isPending}
              aria-label="Increase quantity"
              className="px-3 py-1.5 min-h-[44px] text-stone-600 hover:bg-stone-50 cursor-pointer transition-colors disabled:opacity-40"
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
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={lineTotal}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="font-semibold text-stone-900 tabular-nums"
          >
            {formatPrice(lineTotal)}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
