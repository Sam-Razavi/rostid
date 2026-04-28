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
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product: Pick<Product, 'id' | 'name' | 'slug' | 'priceOre' | 'imageUrl' | 'stock' | 'isActive'>;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPriceOre: number;
  product: Pick<Product, 'id' | 'name' | 'slug' | 'imageUrl'>;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalOre: number;
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
