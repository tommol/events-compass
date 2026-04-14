FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter @events-compass/shared build
RUN pnpm --filter api prisma:generate
RUN pnpm --filter api build

FROM node:20-alpine AS runner

WORKDIR /app

RUN corepack enable

ENV NODE_ENV=production
ENV PORT=8080

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/scripts ./apps/api/scripts

EXPOSE 8080

CMD ["sh", "apps/api/scripts/start-prod.sh"]
