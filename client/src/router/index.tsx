import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import Layout from '../components/layout/Layout';
import AdminLayout from '../components/layout/AdminLayout';

const HomePage = lazy(() => import('../pages/HomePage'));
const ProductsPage = lazy(() => import('../pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('../pages/ProductDetailPage'));
const CartPage = lazy(() => import('../pages/CartPage'));
const OrdersPage = lazy(() => import('../pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('../pages/OrderDetailPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('../pages/admin/AdminProducts'));
const AdminOrders = lazy(() => import('../pages/admin/AdminOrders'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));
const PaymentSuccessPage = lazy(() => import('../pages/PaymentSuccessPage'));
const PaymentCancelPage = lazy(() => import('../pages/PaymentCancelPage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 rounded-full border-2 border-espresso-200 border-t-espresso-700 animate-spin" />
    </div>
  );
}

function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <S><HomePage /></S> },
      { path: '/products', element: <S><ProductsPage /></S> },
      { path: '/products/:slug', element: <S><ProductDetailPage /></S> },
      { path: '/login', element: <S><LoginPage /></S> },
      { path: '/register', element: <S><RegisterPage /></S> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/cart', element: <S><CartPage /></S> },
          { path: '/orders', element: <S><OrdersPage /></S> },
          { path: '/orders/:id', element: <S><OrderDetailPage /></S> },
          { path: '/checkout/success', element: <S><PaymentSuccessPage /></S> },
          { path: '/checkout/cancel', element: <S><PaymentCancelPage /></S> },
        ],
      },
    ],
  },
  {
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/admin', element: <S><AdminDashboard /></S> },
          { path: '/admin/products', element: <S><AdminProducts /></S> },
          { path: '/admin/orders', element: <S><AdminOrders /></S> },
        ],
      },
    ],
  },
  { path: '*', element: <S><NotFoundPage /></S> },
]);
