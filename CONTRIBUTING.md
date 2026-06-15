# Contributing to Rostid

Thank you for your interest in contributing. This document covers how to get set up and what to expect when opening a pull request.

## Prerequisites

- Node.js 20+ (use `nvm use` — `.nvmrc` pins the version)
- PostgreSQL 15+
- A Stripe account with test keys

## Local setup

```bash
git clone https://github.com/sam-razavi/rostid.git
cd rostid
cp server/.env.example server/.env   # fill in your values
make dev-build                        # install deps + run migrations + seed
make dev                              # start server (4000) and client (5173)
```

## Running tests

```bash
make test          # server + client
make test-server   # server only (Jest)
make test-client   # client only (Vitest + coverage)
```

Coverage gates are enforced in CI — the client must stay above 70 % line coverage.

## Linting and type-checking

```bash
make lint       # ESLint for server and client
make typecheck  # tsc --noEmit for both
```

CI runs both; PRs that introduce lint errors or type errors will not be merged.

## Making a change

1. Fork the repo and create a branch from `main`: `git checkout -b feat/your-feature`.
2. Write or update tests for any logic you add.
3. Run `make lint typecheck test` locally before pushing.
4. Open a pull request against `main`. Keep PRs focused — one concern per PR makes review faster.

## Commit style

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add gift card redemption at checkout
fix: prevent duplicate review submission
chore: bump stripe sdk to 17
docs: update deployment guide
```

The first line should complete the sentence *"If applied, this commit will…"* and stay under 72 characters.

## Project structure

```
rostid/
├── client/          # React + Vite + TailwindCSS frontend
│   └── src/
│       ├── api/     # Axios API layer
│       ├── components/
│       ├── hooks/   # TanStack Query mutations/queries
│       ├── pages/
│       └── store/   # Zustand auth store
└── server/          # Express + Prisma backend
    └── src/
        ├── docs/    # OpenAPI spec (served at /api/docs)
        ├── modules/ # Feature modules (auth, cart, orders, …)
        └── lib/     # Shared utilities (JWT, Stripe, mailer)
```

## Sensitive data

Never commit `.env` files or real API keys. The `.gitignore` covers them, but double-check before pushing.

## Questions

Open a [GitHub issue](https://github.com/sam-razavi/rostid/issues) if something is unclear or you'd like to discuss a larger change before investing time in it.
