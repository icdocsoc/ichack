FROM oven/bun:1.1.18 AS base
WORKDIR /ichack25
COPY package.json bun.lockb ./
COPY packages/base-layer/package.json ./packages/base-layer/
COPY apps/admin/package.json ./apps/admin/
COPY server/package.json ./server/
RUN bun install --production
COPY . .

FROM base AS build_server
RUN bun run build:server

FROM base AS server
WORKDIR /prod/server
COPY --from=build_server /ichack25/server/dist .
CMD ["bun", "run", "index.js"]

FROM base AS build_admin
RUN bun run build:admin

FROM base AS admin
WORKDIR /prod/admin
COPY --from=build_admin /ichack25/apps/admin/.output .
CMD [ "bun", "run", "server/index.mjs" ]
