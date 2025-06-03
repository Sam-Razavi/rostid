import * as Sentry from '@sentry/node';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import compression from 'compression';
import { env } from './config/env';

Sentry.init({
  dsn: env.SENTRY_DSN,
  environment: env.NODE_ENV,
  tracesSampleRate: 0.2,
  integrations: [Sentry.expressIntegration()],
});
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
import discountsRoutes from './modules/discounts/discounts.routes';
import newsletterRoutes from './modules/newsletter/newsletter.routes';
import shippingRoutes from './modules/shipping/shipping.routes';
import subscriptionsRoutes from './modules/subscriptions/subscriptions.routes';
import loyaltyRoutes from './modules/loyalty/loyalty.routes';
import giftcardsRoutes from './modules/giftcards/giftcards.routes';

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

app.use(compression());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
  })
);
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.get('/api/health', async (_req, res) => {
  try {
    const { prisma } = await import('./config/prisma');
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'degraded', db: 'unreachable', timestamp: new Date().toISOString() });
  }
});

app.get('/robots.txt', (_req, res) => {
  const clientUrl = env.CLIENT_URL;
  res.setHeader('Content-Type', 'text/plain');
  res.send(
    `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /cart\nDisallow: /orders\nDisallow: /profile\nDisallow: /wishlist\n\nSitemap: ${clientUrl}/sitemap.xml\n`
  );
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
app.use('/api/discounts', discountsRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/giftcards', giftcardsRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/webhooks', webhooksRoutes);

app.get('/sitemap.xml', async (_req, res) => {
  try {
    const [products, categories] = await Promise.all([
      (await import('./config/prisma')).prisma.product.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
      }),
      (await import('./config/prisma')).prisma.category.findMany({
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    const clientUrl = (await import('./config/env')).env.CLIENT_URL;
    const urls: string[] = [];

    urls.push(`  <url><loc>${clientUrl}/products</loc><changefreq>daily</changefreq><priority>0.9</priority></url>`);

    for (const cat of categories) {
      urls.push(`  <url><loc>${clientUrl}/products?category=${cat.slug}</loc><lastmod>${cat.updatedAt.toISOString().split('T')[0]}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`);
    }

    for (const p of products) {
      urls.push(`  <url><loc>${clientUrl}/products/${p.slug}</loc><lastmod>${p.updatedAt.toISOString().split('T')[0]}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
    res.setHeader('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    res.status(500).send('Failed to generate sitemap');
  }
});

Sentry.setupExpressErrorHandler(app);
app.use(errorHandler);

export default app;
