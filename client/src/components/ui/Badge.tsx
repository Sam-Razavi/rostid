import type { OrderStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'brand' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

const variantClasses = {
  default: 'bg-stone-100 text-stone-700',
  brand: 'bg-espresso-100 text-espresso-700',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-amber-100 text-amber-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

const statusVariants: Record<OrderStatus, BadgeProps['variant']> = {
  pending: 'warning',
  confirmed: 'info',
  processing: 'warning',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'error',
};

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant={statusVariants[status]}>
      {statusLabels[status]}
    </Badge>
  );
}

const roastLabels = { light: 'Light Roast', medium: 'Medium Roast', dark: 'Dark Roast' };
const roastVariants = { light: 'bg-amber-50 text-amber-700', medium: 'bg-orange-50 text-orange-700', dark: 'bg-stone-100 text-stone-700' };

export function RoastBadge({ level }: { level: 'light' | 'medium' | 'dark' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roastVariants[level]}`}>
      {roastLabels[level]}
    </span>
  );
}
