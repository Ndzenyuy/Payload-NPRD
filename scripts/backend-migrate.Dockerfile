# Run Payload migrations in Node 20 (avoids host Node/undici issues). Build context: repo root.
FROM node:20-alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app
# Copy package.json first (lockfile optional so backend can exist with only package.json).
COPY backend/package.json ./
RUN corepack enable pnpm && pnpm install --no-frozen-lockfile
COPY backend/ .
RUN pnpm install --no-frozen-lockfile
CMD ["sh", "-c", "pnpm payload migrate:create 2>/dev/null || true; pnpm payload migrate"]
