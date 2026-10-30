FROM node:24-alpine AS base

FROM base AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Rebuild the source code
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=file:/app/data/pastebox.db

RUN mkdir -p /app/data && corepack enable pnpm && pnpm exec drizzle-kit push --force && pnpm run build && pnpm prune --prod \
    && rm -rf /app/.next/standalone/node_modules/typescript \
    /app/.next/standalone/node_modules/.pnpm/typescript* \
    /app/.next/standalone/node_modules/.pnpm/@img* \
    /app/.next/standalone/node_modules/.pnpm/browserslist* \
    /app/.next/standalone/node_modules/.pnpm/sharp* \
    /app/.next/standalone/node_modules/.pnpm/update-browserslist-db*

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN mkdir -p /app/uploads /app/data \
    && chown -R nextjs:nodejs /app/uploads /app/data

COPY --from=builder /app/.next/standalone/node_modules ./node_modules
COPY --from=builder /app/.next/standalone/server.js ./server.js

COPY --from=builder --chown=nextjs:nodejs /app/data/pastebox.db ./data/pastebox.db
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
