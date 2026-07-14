import { useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' };

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  const trapFocus = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !panelRef.current) return;
    const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', trapFocus);
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
        first?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', trapFocus);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape, trapFocus]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        className={`relative w-full ${sizeClasses[size]} bg-white rounded-xl shadow-lg`}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
            <h2 id="modal-title" className="text-lg font-semibold text-stone-900">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-400 hover:text-stone-600 cursor-pointer transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-espresso-500"
              aria-label="Close dialog"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
