# syntax=docker/dockerfile:1

# Build context should be the root of the monorepo
ARG NODE_VERSION=20.11.1

# -------------------------
# 1. Base Stage
# -------------------------
FROM node:${NODE_VERSION}-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# -------------------------
# 2. Builder Stage
# -------------------------
FROM base AS builder
# Set working directory
WORKDIR /app
# Install turbo globally
RUN npm install -g turbo
# Copy the entire monorepo
COPY . .
# Prune the workspace out of all other packages/apps not related to web
RUN turbo prune web --docker

# -------------------------
# 3. Installer Stage
# -------------------------
FROM base AS installer
WORKDIR /app

# First install the dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Copy the pruned project source code
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

# Build the Next.js web application
RUN pnpm turbo run build --filter=web...

# -------------------------
# 4. Runner Stage
# -------------------------
FROM base AS runner
WORKDIR /app

# Best practice: Do not run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=installer /app/apps/web/next.config.js .
COPY --from=installer /app/apps/web/package.json .

# Copy automatically generated standalone Next.js files
# DistDir was configured as .next-build in next.config.js
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next-build/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next-build/static ./apps/web/.next-build/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

ENV PORT=3000
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

# server.js is created by next build from the standalone output
CMD ["node", "apps/web/server.js"]
