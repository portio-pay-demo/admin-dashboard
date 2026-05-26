# admin-dashboard

Internal admin portal for PortIOPay merchant operations, platform configuration, and monitoring. Used by ~40 internal operators.

## Overview

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, tRPC, PostgreSQL, Redis

## Key Features

- Merchant onboarding and configuration management
- Transaction search and manual review
- Real-time metrics dashboard (event-driven cache invalidation — NP-2030 fix)
- Session management with activity-based renewal (NP-2035 fix)
- CSRF protection on all state-mutating forms (NP-2034 fix)
- Role-based access control (Admin, Support, Finance, Read-only)

## Local Development

```bash
npm install
npm run dev
```

App runs on http://localhost:3000

```bash
cp .env.example .env.local
docker compose up -d
npm run dev
```

## Deployment

Deployed as a Next.js app on Vercel (internal SSO required).

- **Production**: `admin.portioapay.internal`
- **Staging**: `admin.staging.portioapay.internal`

## Release History

See [CHANGELOG.md](CHANGELOG.md) for notable changes by version.

## Ownership

- Team: **PortIOPay Platform**
- CODEOWNERS: `@platform-team`, `@merchant-ops`, `@security`
- On-call: PagerDuty service `portioapay-platform`
