FROM oven/bun:1.1.13 AS base
WORKDIR /ichack25
COPY package.json bun.lockb **/package.json ./
RUN bun install --production
COPY . .

FROM base AS build_server
WORKDIR /ichack25/server
RUN bun run build

FROM base AS server
WORKDIR /prod/server
COPY --from=build_server /ichack25/server/dist .
CMD ["bun", "run", "index.js"]