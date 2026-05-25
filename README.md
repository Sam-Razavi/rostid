# Rostid

**Specialty Coffee E-Commerce** — A full-stack DTC platform for a premium Stockholm coffee brand.

> "Rost" (roast) + "tid" (time) — crafted for those who take their coffee seriously.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Animations | Framer Motion |
| State | Zustand, React Query v5 |
| Routing | React Router v6 (lazy-loaded, code-split) |
| Backend | Node.js, Express, TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Payments | Stripe Checkout |
| Auth | JWT (access token + httpOnly refresh cookie) |
| Validation | Zod |
| Charts | Recharts |
| Email | Nodemailer |
| Monitoring | Sentry |
| Rate limiting | express-rate-limit |
| Dev infra | Docker Compose |

---

## Getting started

### Prerequisites
- Docker & Docker Compose
- Node.js 20+

### Local dev

```bash
# Copy and fill in env vars
cp .env.example .env

# Start database
docker-compose up -d db

# Install server deps and run migrations
cd server && npm install
npx prisma migrate dev
npx prisma db seed

# Start server
npm run dev
```

```bash
# In a separate terminal — start client
cd client && npm install && npm run dev
```

App runs at:
- Client: `http://localhost:5173`
- API: `http://localhost:4000/api`

### Full Docker dev

```bash
docker-compose up
```

---

## Features

### Shop

- Browse specialty coffees by category, roast level, and origin
- Product search and filtering with URL-synced state
- Product variants — bag sizes (250g / 500g / 1kg) and grind options per product
- Product reviews with star ratings and average score on cards
- Related products on product detail page
- Wishlist
- Stock badges — "Only N left" warning, out-of-stock overlay

### Cart & Checkout

- Persistent cart backed by PostgreSQL (per user)
- Stripe Checkout integration with atomic order creation
- Shipping rate selector — Standard (49 kr, free over 500 kr) and Express (99 kr)
- Discount codes — percentage and fixed-amount, with min order and expiry support
- Gift card redemption
- Loyalty points — earn 1 pt per 10 kr spent, redeem 100 pts for 10 kr off
- Optimistic cart updates with instant UI feedback and rollback on error

### Subscriptions

- Subscribe & Save — 10% off on recurring coffee deliveries
- Delivery intervals: every 14, 30, or 60 days
- Manage subscriptions: pause, resume, cancel, or change frequency
- Immediate Stripe Checkout on subscribe; renewal endpoint for cron-based processing

### Orders & Returns

- Order history with itemized breakdown and status timeline
- Cancel pending orders
- Request a return on delivered orders — select items and reason
- Admin can approve returns and trigger Stripe refunds automatically

### Loyalty & Gift Cards

- Loyalty account auto-created on first earn
- Points balance and transaction history at `/api/loyalty`
- Points balance chip on profile page; earn preview in cart
- Admin can generate gift cards with custom balance and optional expiry

### Accounts

- JWT auth with silent refresh — no re-login on page reload
- Password reset via email link
- Profile: edit name and email, change password
- Address book: save, edit, set default, and delete shipping addresses

### Admin

- Dashboard: total orders, revenue, active subscriptions, MRR, recent orders, orders-by-status donut, revenue-by-product bar chart
- Product CRUD with image, category, roast level, origin, tasting notes, weight, stock
- Variant management per product (inline table)
- Order management with status updates and CSV export
- Customer list
- Discount code management (create, delete)
- Subscription list with status and next billing date
- Return requests — approve (fires Stripe refund) or reject
- Gift card management — generate and view all cards

### Technical

- Feature-first module structure (each domain: routes / controller / service / schema)
- Atomic checkout via Prisma transaction — snapshot prices, create order + items, decrement stock, clear cart
- Prices stored as integers in öre (1 kr = 100 öre) — no float money
- All routes lazy-loaded with React.lazy + Suspense
- Debounced search (300ms, URL-synced)
- Rate limiting: 10 req/15min on login/register, 5/hr on reviews
- Refresh token cleanup — expired tokens purged on startup and every 24h
- XML sitemap and robots.txt auto-generated from live product data
- Sentry error monitoring on both server and client
- PWA-ready: favicon, web manifest, Open Graph and Twitter meta tags
- Accessibility: skip-to-content, focus trap in modals, aria-labels, 44px touch targets

---

## Seed accounts

| Email | Password | Role |
|---|---|---|
| admin@rostid.se | admin123 | admin |
| customer@rostid.se | password123 | customer |

---

## Project structure

```
rostid/
├── server/
│   ├── src/
│   │   ├── config/            # env, prisma, stripe
│   │   ├── modules/           # auth, products, categories, cart, orders,
│   │   │                      # checkout, webhooks, admin, reviews, wishlist,
│   │   │                      # discounts, shipping, subscriptions, returns,
│   │   │                      # loyalty, giftcards, newsletter, users
│   │   ├── middleware/        # authenticate, requireAdmin, errorHandler
│   │   └── utils/             # AppError, asyncHandler, jwt, email, tokenCleanup
│   └── prisma/                # schema, migrations, seed
├── client/
│   └── src/
│       ├── pages/             # HomePage, ProductsPage, ProductDetailPage,
│       │                      # CartPage, OrdersPage, OrderDetailPage,
│       │                      # ProfilePage, WishlistPage, SubscriptionsPage,
│       │                      # admin/…
│       ├── components/        # ui/, layout/, products/, cart/, orders/
│       ├── hooks/             # useCart, useDebounce
│       ├── api/               # products, orders, auth, admin, checkout,
│       │                      # shipping, subscriptions, loyalty, giftcards
│       ├── store/             # authStore (Zustand)
│       ├── router/            # lazy routes, ProtectedRoute, AdminRoute
│       ├── animations/        # Framer Motion variants
│       └── types/             # shared TypeScript interfaces
├── design-system/             # MASTER.md — design tokens and component guide
├── docker-compose.yml
└── .env.example
```

---

## Architecture notes

**JWT with silent refresh** — Access token in memory, refresh token in httpOnly cookie. Axios interceptor silently refreshes on 401 and queues concurrent requests. On page reload, App.tsx calls refresh → me to restore session before first render.

**Atomic checkout** — Order creation runs inside a Prisma transaction: prices are snapshotted, order and items are created, stock is decremented (variant-aware), and the cart is cleared. All-or-nothing.

**Stripe webhooks** — `checkout.session.completed` is the source of truth for order creation. The checkout service records checkout totals in session metadata, applies combined checkout discounts through a Stripe coupon, and the webhook creates the order idempotently, decrements stock, and processes discount, loyalty, and gift card side-effects.

**Subscriptions (manual interval)** — No Stripe Subscription objects. Each renewal is a fresh Checkout session created by the `/api/subscriptions/process-due` endpoint, which advances `nextBillingDate` by `intervalDays` after firing.

**Loyalty points** — Earned when an admin marks an order as `delivered` (1 pt per 10 kr). Redeemed during checkout as part of the combined Stripe checkout discount. LoyaltyAccount is upserted on first earn.

**Design system** — Warm Scandinavian minimalism. Espresso palette (50–950), Playfair Display serif headings, Inter body, 4pt spacing scale.
