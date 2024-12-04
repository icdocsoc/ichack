function cleanup() {
  docker stop postgres
}
trap cleanup EXIT

# Check if a container with name postgres exists
if docker ps -a --format '{{.Names}}' | grep -Eq "^postgres$"; then
  docker start postgres
else
  docker run -d \
    --name postgres \
    -e POSTGRES_USER=admin \
    -e POSTGRES_PASSWORD=rootpasswd \
    -e POSTGRES_DB=postgres \
    -p 5432:5432 \
    -v ichack_postgres_data:/var/lib/postgresql/data \
    postgres:16
fi

while ! docker exec postgres pg_isready -U test > /dev/null; do
  echo "--- Waiting for Postgres to start ---"
  sleep 1
done

bun --bun nuxt prepare
bun --bun nuxt dev