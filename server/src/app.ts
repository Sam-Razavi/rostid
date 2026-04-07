import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './modules/auth/auth.routes';
import categoriesRoutes from './modules/categories/categories.routes';
import productsRoutes from './modules/products/products.routes';
import cartRoutes from './modules/cart/cart.routes';
import ordersRoutes from './modules/orders/orders.routes';
import adminRoutes from './modules/admin/admin.routes';
import reviewsRoutes from './modules/reviews/reviews.routes';
import checkoutRoutes from './modules/checkout/checkout.routes';
import webhooksRoutes from './modules/webhooks/webhooks.routes';
import usersRoutes from './modules/users/users.routes';
import wishlistRoutes from './modules/wishlist/wishlist.routes';

const app = express();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'TOO_MANY_REQUESTS', message: 'Too many attempts, please try again later' },
});

const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'TOO_MANY_REQUESTS', message: 'Too many review submissions, please try again later' },
});

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products/:slug/reviews', reviewLimiter, reviewsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/webhooks', webhooksRoutes);

app.use(errorHandler);

export default app;
