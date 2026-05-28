# PortIOPay Admin Dashboard

Internal admin portal for **PortIOPay** merchant operations, platform configuration, and monitoring. Used by ~40 internal operators to onboard merchants, review transactions, and observe platform health.

| | |
|---|---|
| **Repository** | [portio-pay-demo/admin-dashboard](https://github.com/portio-pay-demo/admin-dashboard) |
| **Runtime** | Node.js ≥ 20 |
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |

## Table of contents

- [Tech stack](#tech-stack)
- [Architecture overview](#architecture-overview)
- [Key features](#key-features)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local development](#local-development)
- [Environment variables](#environment-variables)
- [Application routes](#application-routes)
- [Authentication and security](#authentication-and-security)
- [Metrics cache](#metrics-cache)
- [Testing and CI](#testing-and-ci)
- [Deployment](#deployment)
- [Ownership](#ownership)

## Tech stack

| Layer | Technology |
|-------|------------|
| UI | React 18, Tailwind CSS |
| App framework | Next.js 14 (App Router) |
| API / data fetching | tRPC, TanStack React Query |
| Auth | NextAuth.js |
| Data stores | PostgreSQL (`pg`), Redis (`ioredis`) |
| Validation | Zod |
| Logging | Pino |

## Architecture overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Internal SSO   │────▶│  Admin Dashboard │────▶│   PostgreSQL    │
│  (NextAuth)     │     │  (Next.js 14)    │     │  (merchant data)│
└─────────────────┘     └────────┬─────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │      Redis       │
                        │  (metrics cache) │
                        └──────────────────┘
```

The dashboard is a server-rendered Next.js application. Authenticated operators access merchant configuration and platform metrics. Redis caches per-merchant metrics with event-driven invalidation when transaction state changes upstream.

## Key features

- **Merchant operations** — Onboarding flows and per-merchant configuration (webhooks, rate-limit tiers).
- **Transaction tooling** — Search and manual review workflows (platform integration).
- **Operations dashboard** — Real-time transaction volume, success rate, and latency summaries.
- **Metrics caching** — Redis-backed merchant metrics with event-driven invalidation when transaction state changes (NP-2030).
- **Session management** — Sliding idle timeout with hard 8-hour cap and client-side expiry warnings (NP-2035).
- **CSRF protection** — Synchronizer-token pattern on state-mutating forms and tRPC mutations (NP-2034).
- **Role-based access control** — Roles: Admin, Support, Finance, Read-only.

## Project structure

```
admin-dashboard/
├── .env.example               # Environment variable template
├── .github/workflows/ci.yml   # Lint, test, build on push/PR
├── CODEOWNERS                 # Review routing by path
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── page.tsx           # Root → auth gate → /dashboard
│   │   ├── dashboard/         # Operations metrics dashboard
│   │   └── merchants/[id]/settings/  # Merchant config UI
│   └── lib/
│       ├── auth/              # Session + CSRF helpers
│       └── metrics-cache.ts   # Redis metrics cache
├── package.json
└── tsconfig.json
```

## Prerequisites

- **Node.js** 20 or later (`engines` in `package.json`)
- **npm** (or compatible package manager)
- **Redis** — Required for merchant metrics cache (local default: `redis://localhost:6379`)
- **PostgreSQL** — Used by NextAuth and platform data (connection configured via env; see below)
- **Internal SSO** — Required for production/staging sign-in (Okta/Azure AD via NextAuth provider config)

## Local development

1. **Clone and install dependencies**

   ```bash
   git clone https://github.com/portio-pay-demo/admin-dashboard.git
   cd admin-dashboard
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your local credentials (see [Environment variables](#environment-variables)). At minimum, set `NEXTAUTH_SECRET` and `DATABASE_URL` for auth; adjust `REDIS_URL` if Redis is not on the default host.

3. **Start Redis** (if not already running)

   ```bash
   docker run -d --name portio-redis -p 6379:6379 redis:7-alpine
   ```

4. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Unauthenticated users are redirected to `/login`; authenticated users land on `/dashboard`.

### Other npm scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js dev server (port 3000) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint (Next.js config) |
| `npm test` | Jest unit tests |
| `npm run test:coverage` | Jest with coverage report |

## Environment variables

Copy `.env.example` to `.env.local` for local overrides (`.env.local` is gitignored). Variables used by the application:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REDIS_URL` | No | `redis://localhost:6379` | Redis connection for merchant metrics cache |
| `NODE_ENV` | Set by tooling | `development` in dev | Enables secure CSRF cookies when `production` |
| `NEXTAUTH_URL` | Yes (auth) | — | Canonical URL of the app (e.g. `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | Yes (auth) | — | Secret for signing session tokens |
| `DATABASE_URL` | Yes (auth/DB) | — | PostgreSQL connection string for NextAuth and platform data |

Additional provider-specific variables (OAuth client ID/secret, issuer URLs) depend on your NextAuth configuration in `src/lib/auth/options`.

See [`.env.example`](.env.example) for a full template with sensible local defaults.

## Application routes

| Route | Access | Purpose |
|-------|--------|---------|
| `/` | Authenticated | Redirects to `/dashboard`; unauthenticated users go to `/login` |
| `/dashboard` | Authenticated | Operations dashboard — 24h transaction volume, success rate, P95 latency |
| `/merchants/:id/settings` | Authenticated | Merchant webhook URL and rate-limit tier configuration |

Server components use `requireSession()` from `src/lib/auth/session.ts` to enforce authentication. Mutations from merchant settings forms must pass CSRF validation via `validateCsrfToken()` in the tRPC mutation layer.

## Authentication and security

- **Sessions** (`src/lib/auth/session.ts`): Sliding 1-hour idle timeout, 8-hour hard maximum, 15-minute warning before expiry (NP-2035).
- **CSRF** (`src/lib/auth/csrf.ts`): Per-session token in `__Host-csrf` cookie; clients echo `x-csrf-token` on mutating requests (NP-2034).
- **CODEOWNERS**: Platform, merchant-ops, and security teams own sensitive paths — see `CODEOWNERS` in the repo root.

## Metrics cache

`src/lib/metrics-cache.ts` stores per-merchant metrics in Redis with a 60-second TTL. When a transaction state changes, `onTransactionStateChange(merchantId)` invalidates the cache entry so the dashboard does not show stale numbers (NP-2030).

Public API:

- `getMerchantMetrics(merchantId)` — read cached metrics
- `setMerchantMetrics(merchantId, metrics)` — write with TTL
- `invalidateMerchantMetrics(merchantId)` — delete on state change
- `onTransactionStateChange(merchantId)` — hook for upstream event consumers

## Testing and CI

GitHub Actions (`.github/workflows/ci.yml`) runs on pushes to `main`/`develop` and on pull requests to `main`:

1. `npm ci`
2. `npm run lint`
3. `npm test -- --coverage`
4. `npm run build`

Run the same checks locally before opening a PR:

```bash
npm run lint && npm test && npm run build
```

## Deployment

The app is deployed as a **Next.js** application on **Vercel** with internal SSO enforced at the edge.

| Environment | URL |
|-------------|-----|
| Production | `https://admin.portioapay.internal` |
| Staging | `https://admin.staging.portioapay.internal` |

Set production environment variables in the Vercel project (or your deployment platform) to match [Environment variables](#environment-variables). Ensure `REDIS_URL` points at the environment-specific Redis cluster and that `NEXTAUTH_URL` matches the deployed hostname.

### Deploy checklist

1. Configure all required environment variables in Vercel project settings.
2. Merge to `main` — Vercel auto-deploys production.
3. Verify SSO login and dashboard metrics load correctly.
4. Confirm Redis connectivity for metrics caching.

## Ownership

| | |
|---|---|
| **Team** | PortIOPay Platform |
| **CODEOWNERS** | `@platform-team`, `@merchant-ops`, `@security` (see `CODEOWNERS`) |
| **On-call** | PagerDuty service `portioapay-platform` |

For incidents or access requests, contact the platform team via the internal `#portioapay-platform` Slack channel.
