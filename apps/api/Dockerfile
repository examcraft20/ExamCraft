# syntax=docker/dockerfile:1

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
# Prune the workspace to just the API
RUN turbo prune api --docker

# -------------------------
# 3. Installer Stage
# -------------------------
FROM base AS installer
WORKDIR /app

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Copy the pruned project source code
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

# Build the NestJS application
RUN pnpm turbo run build --filter=api...

# Clean up dev dependencies to make the image light
RUN pnpm --filter=api deploy --prod /deploy/api

# -------------------------
# 4. Runner Stage
# -------------------------
FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

# Copy the bundled assets from the deploy step
COPY --from=installer --chown=nestjs:nodejs /deploy/api .

ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/main.js"]
