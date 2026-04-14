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
