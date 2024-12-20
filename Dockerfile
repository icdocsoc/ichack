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
COPY --from=builder /app/package.json /app/bun.lockb ./
RUN bun install --production
COPY --from=builder /app/.output ./.output
CMD ["bun", "run", ".output/server/index.mjs"]

FROM oven/bun:1.1.38-alpine AS landing
WORKDIR /prod
COPY --from=builder /app/package.json /app/bun.lockb ./
RUN bun install --production
COPY --from=builder /app/packages/www/dist ./dist
CMD ["bunx", "serve", "dist"]
