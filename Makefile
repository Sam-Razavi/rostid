.PHONY: dev dev-build reset test test-server test-client seed lint typecheck build

# ── Docker ────────────────────────────────────────────────────────────────────

dev:
	docker compose up

dev-build:
	docker compose up --build

reset:
	docker compose down -v && docker compose up --build

# ── Tests ─────────────────────────────────────────────────────────────────────

test: test-server test-client

test-server:
	cd server && npm test

test-client:
	cd client && npm test

# ── Database ──────────────────────────────────────────────────────────────────

seed:
	cd server && npx prisma db seed

# ── Code quality ──────────────────────────────────────────────────────────────

lint:
	cd server && npm run lint
	cd client && npm run lint

typecheck:
	cd server && npm run typecheck
	cd client && npm run typecheck

# ── Build ─────────────────────────────────────────────────────────────────────

build:
	cd server && npm run build
	cd client && npm run build
