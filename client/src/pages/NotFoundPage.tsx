import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-stone-50">
      <div className="text-center">
        <p className="font-serif text-8xl font-semibold text-espresso-200 mb-4">404</p>
        <h1 className="font-serif text-3xl font-semibold text-stone-900 mb-3">Page not found</h1>
        <p className="text-stone-500 mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist. Perhaps it was moved or deleted.
        </p>
        <Link to="/" className="btn-primary inline-flex">
          Back to home
        </Link>
      </div>
    </div>
  );
}
