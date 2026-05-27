# Admin Dashboard — Development Guide

Internal documentation for the PortIOPay Admin Dashboard service.

## Prerequisites

- Node.js 20+
- npm
- PostgreSQL and Redis (local install or Docker)

## Setup

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your local credentials
npm run dev
```

The app runs at http://localhost:3000.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXTAUTH_URL` | Yes | Public URL of the app (e.g. `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | Yes | Session encryption secret |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | No | Redis URL for metrics cache (defaults to `redis://localhost:6379`) |

See `.env.example` for a full template.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm test` | Jest unit tests |

## Deployment

Deployed as a Next.js application on Vercel with internal SSO. See the root [README.md](../README.md) for environment URLs and ownership.

## Security notes

- Never commit `.env`, `.env.local`, or key material (`*.pem`, `*.key`).
- Auth and CSRF logic live under `src/lib/auth/` — changes require `@security` review per CODEOWNERS.
