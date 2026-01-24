import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '../../api/products.api';

interface FiltersProps {
  selectedCategory: string;
  selectedRoast: string;
  search: string;
  sort: string;
  onCategoryChange: (v: string) => void;
  onRoastChange: (v: string) => void;
  onSearchChange: (v: string) => void;
  onSortChange: (v: string) => void;
}

export function ProductFilters({
  selectedCategory,
  selectedRoast,
  search,
  sort,
  onCategoryChange,
  onRoastChange,
  onSearchChange,
  onSortChange,
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
