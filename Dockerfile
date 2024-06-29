FROM oven/bun:1.1.17 AS base
WORKDIR /ichack25
COPY package.json bun.lockb **/package.json ./
RUN bun install
COPY . .

FROM base AS build_server
WORKDIR /ichack25/server
RUN bun run build

FROM base AS server
WORKDIR /prod/server
COPY --from=build_server /ichack25/server/dist .
CMD ["bun", "run", "index.js"]