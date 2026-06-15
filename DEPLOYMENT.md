# Deploying Rostid to Production

This guide walks you through deploying the API to Railway and the client to Vercel, with GitHub Actions running CI on every PR and CD on every push to `main`.

---

## Prerequisites

- A [Railway](https://railway.app) account (free tier works)
- A [Vercel](https://vercel.com) account (free tier works)
- The Rostid repo pushed to GitHub

---

## 1. Deploy the API to Railway

### 1a. Create a new project

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Select the `rostid` repository
3. Railway will detect `railway.toml` and use `server/Dockerfile` automatically

### 1b. Add a PostgreSQL database

1. In the Railway project dashboard, click **+ New** → **Database** → **Add PostgreSQL**
2. Railway automatically injects `DATABASE_URL` into your service's environment

### 1c. Set environment variables

In the Railway service settings → **Variables**, add:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `4000` |
| `JWT_ACCESS_SECRET` | Run: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_REFRESH_SECRET` | Run the same command again for a different value |
| `JWT_ACCESS_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `COOKIE_SECRET` | Run: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `CLIENT_URL` | Your Vercel URL (set after step 2, e.g. `https://rostid.vercel.app`) |
| `STRIPE_SECRET_KEY` | From [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | From Stripe → Webhooks (after adding endpoint) |
| `RESEND_API_KEY` | From [Resend Dashboard](https://resend.com/api-keys) |
| `RESEND_FROM_EMAIL` | A verified sender address in Resend |

### 1d. Run the first migration

After the first deploy, open the Railway service's **Shell** tab and run:

```bash
npx prisma migrate deploy
npx prisma db seed
```

### 1e. Stripe webhook

In [Stripe Dashboard](https://dashboard.stripe.com/webhooks) → **Add endpoint**:
- Endpoint URL: `https://your-app.railway.app/api/webhooks/stripe`
- Events to listen: `checkout.session.completed`
- Copy the **Signing secret** → paste as `STRIPE_WEBHOOK_SECRET` in Railway

---

## 2. Deploy the client to Vercel

### 2a. Import project

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your `rostid` GitHub repo
2. Vercel detects `vercel.json` automatically — no framework override needed

### 2b. Set environment variables

In Vercel project settings → **Environment Variables**:

| Variable | Value |
|---|---|
| `VITE_API_URL` | Your Railway API URL (e.g. `https://rostid-api.railway.app`) |

### 2c. Deploy

Click **Deploy**. Vercel builds `client/` and serves the SPA with proper routing.

---

## 3. Automate with GitHub Actions

### 3a. Get Railway token

In Railway → **Account Settings** → **Tokens** → create a new token → copy it.

### 3b. Get Vercel tokens

```bash
# Install Vercel CLI
npm install -g vercel

# Link to your project (run from repo root)
vercel link

# This creates .vercel/project.json with orgId and projectId
cat .vercel/project.json
```

Get your personal token from [vercel.com/account/tokens](https://vercel.com/account/tokens).

### 3c. Add GitHub secrets

Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Secret name | Value |
|---|---|
| `RAILWAY_TOKEN` | Your Railway token |
| `VERCEL_TOKEN` | Your Vercel personal token |
| `VERCEL_ORG_ID` | `orgId` from `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | `projectId` from `.vercel/project.json` |

From now on, every push to `main` triggers an automatic deploy to both Railway and Vercel.

---

## 4. Verify the deployment

```bash
# API health check
curl https://your-api.railway.app/api/health
# Expected: {"status":"ok","timestamp":"..."}

# Client
open https://your-app.vercel.app
```

---

## Environment summary

| Service | Platform | URL pattern |
|---|---|---|
| API | Railway | `https://rostid-production.up.railway.app` |
| Client | Vercel | `https://rostid.vercel.app` |
| Database | Railway PostgreSQL | Managed, internal |
| Payments | Stripe | Test/live keys |
| Email | Resend | API key |
