# Events Compass Monorepo

Monorepo with:
- `apps/api`: NestJS backend (REST + OpenAPI + Prisma + CQRS)
- `apps/web`: Next.js frontend (App Router)
- `packages/shared`: shared TypeScript types

## Requirements

- Node.js 20+
- pnpm 10+
- Docker + Docker Compose

## Quick Start

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Start PostgreSQL:
   ```bash
   docker compose up -d
   ```
3. Copy env files:
   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env.local
   ```
4. Generate Prisma client:
   ```bash
   pnpm --filter api prisma:generate
   ```
5. (Optional) Run migrations:
   ```bash
   pnpm --filter api prisma:migrate
   ```
6. Run both apps:
   ```bash
   pnpm dev
   ```

## URLs

- Frontend: http://localhost:3000
- Backend: http://localhost:3001/api
- Swagger: http://localhost:3001/api/docs

## Scripts

- `pnpm dev` - run all apps in dev mode through Turborepo
- `pnpm build` - build all packages/apps
- `pnpm lint` - run lint tasks
- `pnpm test` - run tests
- `pnpm test:e2e` - run e2e tests (where configured)

## API v1

- `GET /api/health`
- `POST /api/auth/login`

## Test Commands

- Backend unit tests:
  ```bash
  pnpm --filter api test
  ```
- Backend e2e tests:
  ```bash
  pnpm --filter api test:e2e
  ```
- Frontend tests:
  ```bash
  pnpm --filter web test
  ```

## Deploy API to Scaleway (Serverless Containers)

### Code side (already prepared)

- `apps/api/Dockerfile` builds and runs API in production mode
- `apps/api/scripts/start-prod.sh` runs `prisma migrate deploy` before API start
- `.github/workflows/api-image.yml` builds and pushes API image to Scaleway Registry

### Scaleway checklist

1. Create a PostgreSQL instance (Managed Database) in the same region as your container.
2. Create a Container Registry namespace (for example `events-compass`).
3. Create a Serverless Containers namespace.
4. Create a container service (for example `events-compass-api`).
5. Set env vars in the container service:
   - `NODE_ENV=production`
   - `PORT=8080`
   - `DATABASE_URL=postgresql://...`
6. Deploy image from Registry:
   - `${registry}/${namespace}/events-compass-api:latest`
7. Enable public endpoint and (optionally) custom domain + TLS.

### GitHub checklist

1. Add repository secrets:
   - `SCW_SECRET_KEY`
   - `SCW_REGISTRY` (for example `rg.pl-waw.scw.cloud`)
   - `SCW_NAMESPACE` (your Container Registry namespace name)
2. Push to `main` or run workflow manually (`Build and Push API Image`).
3. Confirm image appears in Scaleway Container Registry.
4. In Scaleway container service, redeploy to newest image tag (`latest` or commit SHA).

### Manual local build check

```bash
docker build -f apps/api/Dockerfile -t events-compass-api:local .
docker run --rm -p 8080:8080 -e DATABASE_URL="postgresql://..." events-compass-api:local
```
