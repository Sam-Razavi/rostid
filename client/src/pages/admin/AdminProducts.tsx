import { useState, FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  fetchAdminProducts, deleteProduct, createProduct, updateProduct,
  fetchAdminVariants, createAdminVariant, deleteAdminVariant, bulkProductAction,
} from '../../api/admin.api';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { ProductForm } from '../../components/products/ProductForm';
import type { Product, ProductVariant } from '../../types';

function VariantManager({ product }: { product: Product }) {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [priceOre, setPriceOre] = useState('');
  const [stock, setStock] = useState('');

  const { data: variants = [], isLoading } = useQuery({
    queryKey: ['admin', 'variants', product.id],
    queryFn: () => fetchAdminVariants(product.id),
  });

  const addVariant = useMutation({
    mutationFn: (v: Partial<ProductVariant>) => createAdminVariant(product.id, v),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'variants', product.id] });
      setName(''); setPriceOre(''); setStock('');
      toast.success('Variant added');
    },
  });

  const removeVariant = useMutation({
    mutationFn: (variantId: string) => deleteAdminVariant(product.id, variantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'variants', product.id] });
      toast.success('Variant removed');
    },
  });

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!name || !priceOre) return;
    addVariant.mutate({ name, priceOre: Math.round(Number(priceOre) * 100), stock: Number(stock) || 0 });
  }

  return (
    <div className="space-y-4">
      {isLoading ? (
        <Skeleton className="h-20 w-full rounded" />
      ) : variants.length === 0 ? (
        <p className="text-sm text-stone-400 text-center py-4">No variants yet</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-stone-500 border-b border-stone-100">
              <th className="pb-2 font-medium">Name</th>
              <th className="pb-2 font-medium text-right">Price</th>
              <th className="pb-2 font-medium text-right">Stock</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {variants.map((v) => (
              <tr key={v.id}>
                <td className="py-2 font-mono text-stone-800">{v.name}</td>
                <td className="py-2 text-right tabular-nums">{Math.round(v.priceOre / 100)} kr</td>
                <td className="py-2 text-right tabular-nums text-stone-500">{v.stock}</td>
                <td className="py-2 text-right">
                  <button
                    onClick={() => removeVariant.mutate(v.id)}
                    className="text-xs text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <form onSubmit={handleAdd} className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="250g" required />
        <Input label="Price (SEK)" type="number" value={priceOre} onChange={(e) => setPriceOre(e.target.value)} placeholder="149" required />
        <Input label="Stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" />
        <div className="col-span-3 flex justify-end">
          <Button type="submit" size="sm" loading={addVariant.isPending}>Add variant</Button>
        </div>
      </form>
    </div>
  );
}

function formatPrice(ore: number) {
  return `${Math.round(ore / 100)} kr`;
}

export default function AdminProducts() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [variantsProduct, setVariantsProduct] = useState<Product | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: fetchAdminProducts,
  });

  const deactivate = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('Product deactivated');
    },
    onError: () => toast.error('Failed to deactivate product'),
  });

  const create = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      setShowCreate(false);
      toast.success('Product created');
    },
    onError: () => toast.error('Failed to create product'),
  });

  const edit = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) => updateProduct(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      setEditingProduct(null);
      toast.success('Product updated');
    },
    onError: () => toast.error('Failed to update product'),
  });

  const bulk = useMutation({
    mutationFn: ({ ids, action }: { ids: string[]; action: 'activate' | 'deactivate' }) => bulkProductAction(ids, action),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      setSelectedIds(new Set());
      toast.success(`${result.updated} products ${vars.action}d`);
    },
    onError: () => toast.error('Bulk action failed'),
  });

  const filtered = products?.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.name.toLowerCase().includes(search.toLowerCase())
  );

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selectedIds.size === (filtered?.length ?? 0)) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered?.map((p) => p.id) ?? []));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-stone-900">Products</h1>
        <Button onClick={() => setShowCreate(true)} size="sm">
          + New product
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <input
          type="search"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-xs text-sm py-2"
        />
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm text-stone-600">{selectedIds.size} selected</span>
            <Button size="sm" variant="secondary" onClick={() => bulk.mutate({ ids: Array.from(selectedIds), action: 'activate' })} loading={bulk.isPending}>
              Activate
            </Button>
            <Button size="sm" variant="secondary" onClick={() => bulk.mutate({ ids: Array.from(selectedIds), action: 'deactivate' })} loading={bulk.isPending} className="text-red-600 hover:text-red-800">
              Deactivate
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-soft border border-stone-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-xs text-stone-500 uppercase tracking-wide">
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" onChange={toggleAll} checked={selectedIds.size > 0 && selectedIds.size === filtered?.length} className="accent-espresso-700" />
                </th>
                <th className="text-left px-6 py-3 font-medium">Product</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Roast</th>
                <th className="text-right px-4 py-3 font-medium">Price</th>
                <th className="text-right px-4 py-3 font-medium hidden sm:table-cell">Stock</th>
                <th className="text-right px-4 py-3 font-medium">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-4"><Skeleton className="h-4 w-4" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                      <td className="px-4 py-4 hidden md:table-cell"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-4 py-4 hidden lg:table-cell"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-4 py-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                      <td className="px-4 py-4 hidden sm:table-cell text-right"><Skeleton className="h-4 w-10 ml-auto" /></td>
                      <td className="px-4 py-4 text-right"><Skeleton className="h-5 w-14 ml-auto rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-8 w-20 ml-auto rounded-lg" /></td>
                    </tr>
                  ))
                : filtered?.map((product) => (
                    <tr key={product.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-4 py-4">
                        <input type="checkbox" checked={selectedIds.has(product.id)} onChange={() => toggleSelect(product.id)} className="accent-espresso-700" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-espresso-50 overflow-hidden shrink-0">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="font-serif text-sm text-espresso-200">R</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-stone-900">{product.name}</p>
                            {product.origin && (
                              <p className="text-xs text-stone-500">{product.origin}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <Badge variant="brand">{product.category.name}</Badge>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell text-stone-600 capitalize">
                        {product.roastLevel ?? '—'}
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-stone-900 tabular-nums">
                        {formatPrice(product.priceOre)}
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell text-right text-stone-600 tabular-nums">
                        {product.stock}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Badge variant={product.isActive ? 'success' : 'error'}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setVariantsProduct(product)}
                          >
                            Variants
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingProduct(product)}
                          >
                            Edit
                          </Button>
                          {product.isActive && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deactivate.mutate(product.id)}
                              loading={deactivate.isPending && deactivate.variables === product.id}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              Deactivate
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={!!variantsProduct}
        onClose={() => setVariantsProduct(null)}
        title={`Variants: ${variantsProduct?.name ?? ''}`}
        size="lg"
      >
        {variantsProduct && <VariantManager product={variantsProduct} />}
      </Modal>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New product" size="lg">
        <ProductForm
          onSubmit={(data) => create.mutateAsync(data as Parameters<typeof createProduct>[0]).then(() => undefined)}
          submitLabel="Create product"
          isLoading={create.isPending}
        />
      </Modal>

      <Modal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        title={`Edit: ${editingProduct?.name ?? ''}`}
        size="lg"
      >
        {editingProduct && (
          <ProductForm
            initialData={editingProduct}
            onSubmit={(data) => edit.mutateAsync({ id: editingProduct.id, data: data as Partial<Product> }).then(() => undefined)}
            submitLabel="Save changes"
            isLoading={edit.isPending}
          />
        )}
      </Modal>
    </div>
  );
}
