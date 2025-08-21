import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '../api/products.api';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-stone-50">
      <div className="text-center max-w-lg w-full">
        <p className="font-serif text-8xl font-semibold text-espresso-200 mb-4">404</p>
        <h1 className="font-serif text-3xl font-semibold text-stone-900 mb-3">Page not found</h1>
        <p className="text-stone-500 mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist. Try searching for a coffee below.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2 mb-8 max-w-xs mx-auto">
          <input
            type="search"
            placeholder="Search coffees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field flex-1 text-sm"
          />
          <button type="submit" className="btn-primary text-sm px-4">
            Search
          </button>
        </form>

        {categories && categories.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Browse categories</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.slug}`}
                  className="px-4 py-2 rounded-full border border-stone-200 text-sm text-stone-700 hover:border-espresso-400 hover:text-espresso-800 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        <Link to="/" className="btn-secondary inline-flex text-sm">
          Back to home
        </Link>
      </div>
    </div>
  );
}
