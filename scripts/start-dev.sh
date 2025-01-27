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
if [[ -z "$CI" || "$CI" == "false" ]] && [ "$target" != "landing" ]; then
  docker compose up postgres -d

  while ! docker exec ichack_postgres pg_isready -U test > /dev/null; do
    echo "--- Waiting for Postgres to start ---"
    sleep 1
  done
fi

# Start the dev server based on the target
if [[ "$target" == "website" ]]; then
  bun --bun nuxt dev --host
elif [[ "$target" == "landing" ]]; then
  bun --bun nuxt dev --cwd packages/www --port 3001 --host
elif [[ "$target" == "both" ]]; then
  bunx concurrently -n "website,landing" -c "blue,green" "bun --bun nuxt dev --host" "bun --bun nuxt dev --cwd packages/www --port 3001 --host"
fi

function cleanup() {
  docker compose down postgres
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