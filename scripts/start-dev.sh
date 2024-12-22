# Usage: Start the development server for the website or landing page
# Arguments:
#   $1: Target to start the dev server for. Can be "website", "landing" or "both". Default: "both"


# Check the target of this dev script
target=$1
if [ -z "$target" ]; then
  target="both"
fi

# Validate the target
if [ "$target" != "website" ] && [ "$target" != "landing" ] && [ "$target" != "both" ]; then
  echo "Invalid target: $target"
  echo "Usage: $0 {website|landing|both} [Default: both]"
  exit 1
fi

# Only start the docker container if it is not in CI
if [[ -z "$CI" || "$CI" == "false" ]]; then
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
fi

# Start the dev server based on the target
if [[ "$target" == "website" ]]; then
  bun --bun nuxt dev
elif [[ "$target" == "landing" ]]; then
  bun --bun nuxt dev --cwd packages/www --port 3001
elif [[ "$target" == "both" ]]; then
  bunx concurrently -n "website,landing" -c "blue,green" "bun --bun nuxt dev" "bun --bun nuxt dev --cwd packages/www --port 3001"
fi

function cleanup() {
  docker stop postgres
  if [ "$target" == "website" ]; then
    bunx kill-port 3000
  elif [ "$target" == "landing" ]; then
    bunx kill-port 3001
  elif [ "$target" == "both" ]; then
    bunx kill-port 3000
    bunx kill-port 3001
  fi
}
trap cleanup EXIT