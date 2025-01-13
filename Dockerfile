FROM oven/bun:1.1.38-alpine AS builder
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM oven/bun:1.1.38-alpine AS website
WORKDIR /prod
COPY --from=builder /app/.output ./
CMD ["bun", "run", "server/index.mjs"]

FROM oven/bun:1.1.38-alpine AS landing
COPY --from=builder /app/packages/www/.output/public ./prod
CMD ["bunx", "serve", "prod"]
