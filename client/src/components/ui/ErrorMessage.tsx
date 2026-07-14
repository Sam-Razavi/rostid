interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message = 'Something went wrong.', onRetry }: ErrorMessageProps) {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mb-4">
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <p className="text-stone-600 mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-sm px-4 py-2 rounded-lg">
          Try again
        </button>
      )}
    </div>
  );
}
