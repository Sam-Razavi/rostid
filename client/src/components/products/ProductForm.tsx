import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { fetchCategories } from '../../api/products.api';
import type { Product } from '../../types';

type ProductFormData = {
  name: string;
  description: string;
  priceOre: number;
  categoryId: string;
  roastLevel: string;
  origin: string;
  tastingNotes: string;
  weightGrams: number | '';
  stock: number;
  imageUrl: string;
};

interface ProductFormProps {
  initialData?: Partial<Product>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  submitLabel: string;
  isLoading: boolean;
}

export function ProductForm({ initialData, onSubmit, submitLabel, isLoading }: ProductFormProps) {
  const [form, setForm] = useState<ProductFormData>({
    name: initialData?.name ?? '',
    description: initialData?.description ?? '',
    priceOre: initialData?.priceOre ?? 0,
    categoryId: initialData?.categoryId ?? '',
    roastLevel: initialData?.roastLevel ?? '',
    origin: initialData?.origin ?? '',
    tastingNotes: initialData?.tastingNotes ?? '',
    weightGrams: initialData?.weightGrams ?? '',
    stock: initialData?.stock ?? 0,
    imageUrl: initialData?.imageUrl ?? '',
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  function set(field: keyof ProductFormData, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <Input
        label="Product name"
        value={form.name}
        onChange={(e) => set('name', e.target.value)}
        placeholder="Ethiopia Yirgacheffe"
        required
      />

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">Category</label>
        <select
          value={form.categoryId}
          onChange={(e) => set('categoryId', e.target.value)}
          required
          className="input-field"
        >
          <option value="">Select category</option>
          {categories?.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={3}
          required
          className="input-field resize-none"
          placeholder="A bright, floral single origin..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Price (kr)"
          type="number"
          min={0}
          step={0.01}
          value={form.priceOre ? form.priceOre / 100 : ''}
          onChange={(e) => set('priceOre', Math.round(parseFloat(e.target.value || '0') * 100))}
          placeholder="189"
          required
        />
        <Input
          label="Stock"
          type="number"
          min={0}
          value={form.stock}
          onChange={(e) => set('stock', parseInt(e.target.value || '0', 10))}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">Roast level</label>
        <select
          value={form.roastLevel}
          onChange={(e) => set('roastLevel', e.target.value)}
          className="input-field"
        >
          <option value="">None</option>
          <option value="light">Light</option>
          <option value="medium">Medium</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Origin"
          value={form.origin}
          onChange={(e) => set('origin', e.target.value)}
          placeholder="Ethiopia"
        />
        <Input
          label="Weight (g)"
          type="number"
          min={0}
          value={form.weightGrams}
          onChange={(e) => set('weightGrams', e.target.value ? parseInt(e.target.value, 10) : '')}
          placeholder="250"
        />
      </div>

      <Input
        label="Tasting notes"
        value={form.tastingNotes}
        onChange={(e) => set('tastingNotes', e.target.value)}
        placeholder="Blueberry, jasmine, dark chocolate"
      />

      <Input
        label="Image URL"
        type="url"
        value={form.imageUrl}
        onChange={(e) => set('imageUrl', e.target.value)}
        placeholder="https://..."
      />

      <div className="pt-2">
        <Button type="submit" loading={isLoading} size="lg" className="w-full">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
