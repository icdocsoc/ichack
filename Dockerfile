FROM oven/bun:1.1.29

WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --production
COPY . .

RUN bun run build
CMD ["bun", "run", ".output/server/index.mjs"]