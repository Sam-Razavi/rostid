import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '../../api/products.api';

interface FiltersProps {
  selectedCategory: string;
  selectedRoast: string;
  search: string;
  sort: string;
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
  onCategoryChange: (v: string) => void;
  onRoastChange: (v: string) => void;
  onSearchChange: (v: string) => void;
  onSortChange: (v: string) => void;
  onMinPriceChange: (v: string) => void;
  onMaxPriceChange: (v: string) => void;
  onInStockChange: (v: boolean) => void;
}

export function ProductFilters({
  selectedCategory,
  selectedRoast,
  search,
  sort,
  minPrice,
  maxPrice,
  inStock,
  onCategoryChange,
  onRoastChange,
  onSearchChange,
  onSortChange,
  onMinPriceChange,
  onMaxPriceChange,
  onInStockChange,
}: FiltersProps) {
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  return (
    <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
      <input
        type="search"
        placeholder="Search coffees..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="input-field max-w-xs text-sm py-2"
      />

      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="input-field max-w-[180px] text-sm py-2 cursor-pointer"
      >
        <option value="">All categories</option>
        {categories?.map((cat) => (
          <option key={cat.id} value={cat.slug}>
            {cat.name}
          </option>
        ))}
      </select>

      <select
        value={selectedRoast}
        onChange={(e) => onRoastChange(e.target.value)}
        className="input-field max-w-[160px] text-sm py-2 cursor-pointer"
      >
        <option value="">All roasts</option>
        <option value="light">Light</option>
        <option value="medium">Medium</option>
        <option value="dark">Dark</option>
      </select>

      <div className="flex items-center gap-1.5">
        <input
          type="number"
          placeholder="Min kr"
          value={minPrice}
          onChange={(e) => onMinPriceChange(e.target.value)}
          min={0}
          className="input-field w-20 text-sm py-2"
        />
        <span className="text-stone-400 text-sm">–</span>
        <input
          type="number"
          placeholder="Max kr"
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(e.target.value)}
          min={0}
          className="input-field w-20 text-sm py-2"
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-stone-600 hover:text-stone-900">
        <input
          type="checkbox"
          checked={inStock}
          onChange={(e) => onInStockChange(e.target.checked)}
          className="w-4 h-4 rounded border-stone-300 text-espresso-700 focus:ring-espresso-500 cursor-pointer"
        />
        In stock only
      </label>

      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        className="input-field max-w-[180px] text-sm py-2 cursor-pointer ml-auto"
      >
        <option value="newest">Newest first</option>
        <option value="price_asc">Price: low to high</option>
        <option value="price_desc">Price: high to low</option>
        <option value="name_asc">Name A–Z</option>
      </select>
    </div>
  );
}
