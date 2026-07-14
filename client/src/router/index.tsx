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
const AdminOrderDetail = lazy(() => import('../pages/admin/AdminOrderDetail'));
const AdminCustomers = lazy(() => import('../pages/admin/AdminCustomers'));
const AdminDiscounts = lazy(() => import('../pages/admin/AdminDiscounts'));
const AdminSubscriptions = lazy(() => import('../pages/admin/AdminSubscriptions'));
const AdminGiftCards = lazy(() => import('../pages/admin/AdminGiftCards'));
const AdminReturns = lazy(() => import('../pages/admin/AdminReturns'));
const AdminNewsletter = lazy(() => import('../pages/admin/AdminNewsletter'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));
const PaymentSuccessPage = lazy(() => import('../pages/PaymentSuccessPage'));
const PaymentCancelPage = lazy(() => import('../pages/PaymentCancelPage'));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const WishlistPage = lazy(() => import('../pages/WishlistPage'));
const SubscriptionsPage = lazy(() => import('../pages/SubscriptionsPage'));

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
      {
        path: '/',
        element: (
          <S>
            <HomePage />
          </S>
        ),
      },
      {
        path: '/products',
        element: (
          <S>
            <ProductsPage />
          </S>
        ),
      },
      {
        path: '/products/:slug',
        element: (
          <S>
            <ProductDetailPage />
          </S>
        ),
      },
      {
        path: '/login',
        element: (
          <S>
            <LoginPage />
          </S>
        ),
      },
      {
        path: '/register',
        element: (
          <S>
            <RegisterPage />
          </S>
        ),
      },
      {
        path: '/forgot-password',
        element: (
          <S>
            <ForgotPasswordPage />
          </S>
        ),
      },
      {
        path: '/reset-password',
        element: (
          <S>
            <ResetPasswordPage />
          </S>
        ),
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/profile',
            element: (
              <S>
                <ProfilePage />
              </S>
            ),
          },
          {
            path: '/wishlist',
            element: (
              <S>
                <WishlistPage />
              </S>
            ),
          },
          {
            path: '/cart',
            element: (
              <S>
                <CartPage />
              </S>
            ),
          },
          {
            path: '/orders',
            element: (
              <S>
                <OrdersPage />
              </S>
            ),
          },
          {
            path: '/orders/:id',
            element: (
              <S>
                <OrderDetailPage />
              </S>
            ),
          },
          {
            path: '/subscriptions',
            element: (
              <S>
                <SubscriptionsPage />
              </S>
            ),
          },
          {
            path: '/checkout/success',
            element: (
              <S>
                <PaymentSuccessPage />
              </S>
            ),
          },
          {
            path: '/checkout/cancel',
            element: (
              <S>
                <PaymentCancelPage />
              </S>
            ),
          },
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
          {
            path: '/admin',
            element: (
              <S>
                <AdminDashboard />
              </S>
            ),
          },
          {
            path: '/admin/products',
            element: (
              <S>
                <AdminProducts />
              </S>
            ),
          },
          {
            path: '/admin/orders',
            element: (
              <S>
                <AdminOrders />
              </S>
            ),
          },
          {
            path: '/admin/orders/:id',
            element: (
              <S>
                <AdminOrderDetail />
              </S>
            ),
          },
          {
            path: '/admin/customers',
            element: (
              <S>
                <AdminCustomers />
              </S>
            ),
          },
          {
            path: '/admin/discounts',
            element: (
              <S>
                <AdminDiscounts />
              </S>
            ),
          },
          {
            path: '/admin/subscriptions',
            element: (
              <S>
                <AdminSubscriptions />
              </S>
            ),
          },
          {
            path: '/admin/returns',
            element: (
              <S>
                <AdminReturns />
              </S>
            ),
          },
          {
            path: '/admin/gift-cards',
            element: (
              <S>
                <AdminGiftCards />
              </S>
            ),
          },
          {
            path: '/admin/newsletter',
            element: (
              <S>
                <AdminNewsletter />
              </S>
            ),
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: (
      <S>
        <NotFoundPage />
      </S>
    ),
  },
]);
