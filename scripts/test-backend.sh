ROOT_DIR=$(pwd)
export NODE_ENV=test

export PGUSER=test
export PGHOST=0.0.0.0
export PGDB=postgres
export PGPASSWORD=test
export PGPORT=5432

DOCKER_CONTAINER_NAME=postgres_test

# Assert that ROOT_DIR is the root directory
if [ ! -f "$ROOT_DIR/scripts/test-backend.sh" ]; then
  echo "This script must be run from the root directory."
  exit 1
fi

hasDocker=$(which docker)
if [ -z "$hasDocker" ]; then
  echo "Docker is not installed. Please install Docker to run the tests."
  exit 1
fi

hasPsql=$(which psql)
if [ -z "$hasPsql" ]; then
  echo "Psql is not installed. Please install Psql to run the tests."
  exit 1
fi

cleanup() {
  # Stop the Docker container
  if [[ -n "$(docker ps -q -f name=$DOCKER_CONTAINER_NAME)" ]]; then
    echo "--- Killing Postgres ---"
    docker stop $DOCKER_CONTAINER_NAME > /dev/null
  fi
}
trap cleanup EXIT

echo "--- Starting Postgres ---"
processes=$(docker ps -a --format '{{.Names}}')
if [[ $processes == *"$DOCKER_CONTAINER_NAME"* ]]; then
  docker restart $DOCKER_CONTAINER_NAME > /dev/null
else
  docker run -d \
    --name $DOCKER_CONTAINER_NAME \
    -e POSTGRES_USER=$PGUSER \
    -e POSTGRES_PASSWORD=$PGPASSWORD \
    -p $PGPORT:5432 \
    postgres:16 > /dev/null
fi
sleep 1

# Check if docker run was successful
if [ "$(docker inspect -f '{{.State.Running}}' $DOCKER_CONTAINER_NAME)" != "true" ]; then
  echo "Failed to start Postgres container."
  exit 1
fi

while ! docker exec $DOCKER_CONTAINER_NAME pg_isready -U test > /dev/null; do
  echo "--- Waiting for Postgres to start ---"
  sleep 1
done

echo "--- Setting up database ---"
if bun run backend:push-schema 2>&1 | grep "Error"; then
  echo "--- Database setup failed ---"
  exit 1
else
  echo "--- Database setup successful ---"
fi

echo "--- Running REST tests ---"
bun test server $@
REST_CODE=$?

exit $REST_CODE
# The exit will invoke the cleanup function