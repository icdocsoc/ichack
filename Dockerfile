FROM oven/bun:1.1.38-debian AS base
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
RUN bunx playwright install --with-deps

FROM oven/bun:1.1.38-alpine AS builder
WORKDIR /app
COPY --from=base /app .
COPY . .
RUN bun run build

FROM oven/bun:1.1.38-alpine AS website
WORKDIR /prod
COPY --from=builder /app/.output ./
CMD ["bun", "run", "server/index.mjs"]

FROM oven/bun:1.1.38-alpine AS landing
COPY --from=builder /app/packages/www/dist ./prod
CMD ["bunx", "serve", "prod"]
