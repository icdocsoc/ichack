function cleanup() {
  docker compose down
}
trap cleanup EXIT

docker compose up -d postgres
bun --bun nuxt prepare
bun --bun nuxt dev