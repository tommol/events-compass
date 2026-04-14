FROM node:20-bookworm-slim AS builder

WORKDIR /app

RUN corepack enable
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter @events-compass/shared build
RUN pnpm --filter api prisma:generate
RUN pnpm --filter api build

FROM node:20-bookworm-slim AS runner

WORKDIR /app

RUN corepack enable
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=8080

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY apps/api/prisma apps/api/prisma

RUN pnpm install --frozen-lockfile --prod
RUN pnpm --filter api prisma:generate

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/scripts ./apps/api/scripts

EXPOSE 8080

CMD ["sh", "apps/api/scripts/start-prod.sh"]
