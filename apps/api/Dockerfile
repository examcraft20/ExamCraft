FROM node:18-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app
# Install turbo globally
RUN npm install -g turbo
COPY . .
# Prune the workspace for the api package
RUN turbo prune --scope=api --docker

FROM base AS installer
WORKDIR /app
# Copy pruned lockfile and package.json's
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the actual source code
COPY --from=builder /app/out/full/ .
# Build the api project
RUN pnpm turbo run build --filter=api

FROM base AS runner
WORKDIR /app
COPY --from=installer /app .
# Railway dynamically sets the PORT env variable
ENV PORT=4000
EXPOSE $PORT
CMD ["pnpm", "--filter=api", "run", "start:prod"]
