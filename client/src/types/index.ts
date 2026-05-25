export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count?: { products: number };
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  grind: string | null;
  priceOre: number;
  stock: number;
  sku: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceOre: number;
  imageUrl: string | null;
  categoryId: string;
  category: Pick<Category, 'id' | 'name' | 'slug'>;
  roastLevel: 'light' | 'medium' | 'dark' | null;
  origin: string | null;
  tastingNotes: string | null;
  weightGrams: number | null;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  avgRating?: number | null;
  variants?: ProductVariant[];
}

export interface CartItemVariant {
  id: string;
  name: string;
  grind: string | null;
  priceOre: number;
  stock: number;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  product: Pick<Product, 'id' | 'name' | 'slug' | 'priceOre' | 'imageUrl' | 'stock' | 'isActive'>;
  variant: CartItemVariant | null;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
}

export interface OrderItemVariant {
  id: string;
  name: string;
  grind: string | null;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  unitPriceOre: number;
  product: Pick<Product, 'id' | 'name' | 'slug' | 'imageUrl'>;
  variant: OrderItemVariant | null;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  subtotalOre?: number;
  discountOre?: number;
  loyaltyDiscountOre?: number;
  giftCardOre?: number;
  totalOre: number;
  shippingOre?: number;
  shippingAddressId?: string | null;
  shippingRateId?: string | null;
  stripeSessionId?: string | null;
  trackingNumber?: string | null;
  carrier?: string | null;
  fulfilledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductsResponse {
  products: Product[];
  pagination: Pagination;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface ApiError {
  error: string;
  message: string;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  body: string | null;
  createdAt: string;
  user: { id: string; name: string };
}

export interface ReviewsData {
  reviews: Review[];
  avgRating: number | null;
  count: number;
}
