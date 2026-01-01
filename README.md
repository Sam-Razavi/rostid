# Rostid

**Specialty Coffee E-Commerce** — A premium Stockholm coffee brand built with React, Node.js, and PostgreSQL.

"Rost" (roast) + "tid" (time) — crafted for those who take their coffee seriously.

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
├── server/         # Express API
├── client/         # React SPA
├── docker-compose.yml
└── .env.example
```
