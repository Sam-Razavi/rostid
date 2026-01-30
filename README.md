# Rostid

**Specialty Coffee E-Commerce** — A premium Stockholm coffee brand built with React, Node.js, and PostgreSQL.

> "Rost" (roast) + "tid" (time) — crafted for those who take their coffee seriously.

Built as a portfolio project across 30 days of development (January 2026). Full stack, production-quality patterns throughout.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| State | Zustand, React Query v5 |
| Routing | React Router v6 |
| Backend | Node.js, Express, TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT (access token + httpOnly refresh cookie) |
| Validation | Zod |
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

- Browse specialty coffees by category, roast level, and origin
- Product search and filtering
- Persistent cart (PostgreSQL-backed, per user)
- Secure checkout → order creation via atomic Prisma transaction
- Order history with status tracking
- JWT auth with silent refresh (no re-login on page reload)
- Admin dashboard: product CRUD, order management, sales stats

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
│   │   ├── modules/           # auth, products, categories, cart, orders, admin
│   │   ├── middleware/        # authenticate, requireAdmin, errorHandler
│   │   └── utils/             # AppError, asyncHandler, jwt, formatPrice
│   └── prisma/                # schema + migrations + seed
├── client/                    # React SPA
│   └── src/
│       ├── pages/             # HomePage, ProductsPage, CartPage, OrdersPage, admin/…
│       ├── components/        # ui/, layout/, products/, cart/, orders/
│       ├── hooks/             # useCart, useAuth
│       ├── api/               # products.api, orders.api, auth.api, admin.api, client
│       ├── store/             # authStore (Zustand)
│       ├── router/            # routes + ProtectedRoute + AdminRoute
│       └── types/             # shared TypeScript types
├── design-system/             # MASTER.md — Rostid design tokens & components
├── docker-compose.yml
└── .env.example
```

## Architecture highlights

- **JWT with silent refresh** — access token in memory, refresh token in httpOnly cookie. Axios interceptor silently refreshes on 401 and queues concurrent requests.
- **Atomic checkout** — placing an order runs a Prisma transaction: snapshot prices, create order + items, decrement stock, clear cart. All-or-nothing.
- **Feature-first modules** — each domain (auth, products, cart, orders, admin) is a self-contained folder with routes/controller/service/schema.
- **Cart in PostgreSQL** — not localStorage. One cart per user. `@@unique([cartId, productId])` — adding the same product increments quantity.
- **Prices in öre** — all stored as integers (1 kr = 100 öre). No floats for money.
