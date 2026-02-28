# Rostid

**Specialty Coffee E-Commerce** — A premium Stockholm coffee brand built with React, Node.js, and PostgreSQL.

> "Rost" (roast) + "tid" (time) — crafted for those who take their coffee seriously.

Built as a portfolio project across 58 days of development (January–February 2026). Full stack, production-quality patterns throughout.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Animations | Framer Motion |
| State | Zustand, React Query v5 |
| Routing | React Router v6 (code-split, lazy-loaded) |
| Backend | Node.js, Express, TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT (access token + httpOnly refresh cookie) |
| Validation | Zod |
| Charts | Recharts |
| Notifications | react-hot-toast |
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

# Install server deps
cd server && npm install

# Run migrations + seed
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
- Client: http://localhost:5173
- API: http://localhost:4000/api

### Full Docker dev

```bash
docker-compose up
```

---

## Features

### January 2026 — Core platform

- Browse specialty coffees by category, roast level, and origin
- Product search and filtering with URL-synced state
- Persistent cart (PostgreSQL-backed, per user)
- Secure checkout → order creation via atomic Prisma transaction
- Order history with status tracking
- JWT auth with silent refresh (no re-login on page reload)
- Admin dashboard: product CRUD, order management, sales stats

### February 2026 — Polish and features

- **Session restore on reload** — POST /auth/refresh → GET /auth/me on mount; spinner during restore
- **PWA ready** — favicon, web manifest, OG/Twitter meta tags
- **Toast notifications** — react-hot-toast across cart, checkout, auth flows
- **Mobile navigation drawer** — spring-animated slide-out with Framer Motion, full keyboard support
- **Entrance animations** — staggered hero text, whileInView product grid, page transitions via AnimatePresence
- **Product reviews** — POST /products/:slug/reviews (authenticated), star rating UI, avg rating on cards, one review per user per product
- **Related products** — same-category grid on product detail page
- **Optimistic cart updates** — instant UI feedback with rollback on error (React Query onMutate/onError/onSettled)
- **Admin product create/edit** — modal forms with full field set (name, slug, description, price, category, roast, origin, weight, stock, image)
- **Order detail page** — itemized breakdown, order timeline stepper component
- **Admin charts** — revenue bar chart + orders-by-status donut (Recharts, responsive)
- **Admin CSV export** — one-click download of orders table as .csv
- **Stock badges** — "Only N left" warning when stock ≤ 5, out-of-stock overlay and disabled add-to-cart
- **Debounced search** — 300ms debounce, URL-synced with `replace: true`
- **Rate limiting** — 10 req/15min on login/register, 5/hr on reviews
- **Refresh token cleanup** — expired tokens purged on startup and every 24h
- **Accessibility** — skip-to-content link, focus trap in modals, focus moves to main on route change, aria-labels throughout, 44px touch targets
- **Code splitting** — all routes lazy-loaded with React.lazy + Suspense

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
├── server/                    # Express API
│   ├── src/
│   │   ├── config/            # env + prisma singleton
│   │   ├── modules/           # auth, products, categories, cart, orders, admin, reviews
│   │   ├── middleware/        # authenticate, requireAdmin, errorHandler, rate-limit
│   │   └── utils/             # AppError, asyncHandler, jwt, formatPrice, tokenCleanup
│   └── prisma/                # schema + migrations + seed
├── client/                    # React SPA
│   └── src/
│       ├── pages/             # HomePage, ProductsPage, CartPage, OrdersPage, OrderDetailPage, admin/…
│       ├── components/        # ui/, layout/, products/, cart/, orders/
│       ├── hooks/             # useCart (optimistic), useDebounce
│       ├── api/               # products, orders, auth, admin, reviews, client
│       ├── store/             # authStore (Zustand)
│       ├── router/            # lazy routes + ProtectedRoute + AdminRoute
│       ├── animations/        # Framer Motion variants (fadeUp, staggerContainer, …)
│       └── types/             # shared TypeScript types
├── design-system/             # MASTER.md — Rostid design tokens & components
├── docker-compose.yml
└── .env.example
```

## Architecture highlights

- **JWT with silent refresh** — access token in memory, refresh token in httpOnly cookie. Axios interceptor silently refreshes on 401 and queues concurrent requests. On page reload, App.tsx calls refresh → me to restore session before first render.
- **Atomic checkout** — placing an order runs a Prisma transaction: snapshot prices, create order + items, decrement stock, clear cart. All-or-nothing.
- **Feature-first modules** — each domain (auth, products, cart, orders, admin, reviews) is a self-contained folder with routes/controller/service/schema.
- **Cart in PostgreSQL** — not localStorage. One cart per user. `@@unique([cartId, productId])` — adding the same product increments quantity.
- **Optimistic updates** — cart mutations update the UI immediately via React Query's onMutate, with snapshot rollback on error.
- **Prices in öre** — all stored as integers (1 kr = 100 öre). No floats for money.
- **Code splitting** — every page is a separate JS chunk loaded on demand. Initial bundle only ships Layout, Navbar, and auth store.
- **Design system** — warm Scandinavian minimalism. Espresso palette (50–950), Playfair Display serif headings, Inter body, consistent 4pt spacing scale.
