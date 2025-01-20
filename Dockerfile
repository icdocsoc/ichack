FROM oven/bun:1.1.44-alpine AS builder
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --no-save
COPY . .
RUN bun run build

FROM oven/bun:1.1.44-alpine AS website
WORKDIR /prod
COPY --from=builder /app/.output ./
CMD ["bun", "run", "server/index.mjs"]

FROM oven/bun:1.1.44-alpine AS landing
COPY --from=builder /app/packages/www/.output/public ./prod
CMD ["bunx", "serve", "prod"]
