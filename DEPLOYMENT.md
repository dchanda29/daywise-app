# DayWise Deployment Guide

This guide covers production deployment for DayWise using Vercel (recommended) and Docker.

## Prerequisites

- Node.js 22+
- pnpm
- MySQL or TiDB database
- Manus OAuth credentials
- Forge API key

## Required Environment Variables

Set these in your deployment platform (do not commit secrets):

```env
DATABASE_URL=mysql://user:password@host:3306/daywise_db
JWT_SECRET=your_jwt_secret_key_min_32_chars
VITE_APP_ID=your_manus_app_id
OAUTH_SERVER_URL=https://oauth.manus.im
VITE_OAUTH_PORTAL_URL=https://app.manus.im
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=your_forge_api_key
NODE_ENV=production
```

## Option 1: Vercel

Repository is pre-configured with:

- `vercel.json`
- `api/index.ts`

### Steps

1. Push your code to GitHub.
2. In Vercel, import the repository.
3. Confirm project settings:
   - Install command: `pnpm install --frozen-lockfile`
   - Build command: `pnpm build`
4. Add all required environment variables.
5. Deploy.

## Option 2: Docker

Repository includes:

- `Dockerfile`
- `.dockerignore`

### Build and run

```bash
docker build -t daywise-app .
docker run --env-file .env.local -p 3000:3000 daywise-app
```

## Database Migration

Run migrations before or during release:

```bash
pnpm db:push
```

## Release Checklist

- [ ] `NODE_ENV=production` is set
- [ ] Production `DATABASE_URL` is configured
- [ ] `JWT_SECRET` is strong (32+ chars)
- [ ] OAuth values are configured
- [ ] Forge API key is configured
- [ ] CI checks pass on `main`
