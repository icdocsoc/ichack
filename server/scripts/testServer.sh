CALL_DIR=$(pwd)
export NODE_ENV=test
export PGPASSWORD=test
DOCKER_CONTAINER_NAME=postgres_test

# Assert that CALL_DIR is the server directory
if [ ! -f "$CALL_DIR/scripts/testServer.sh" ]; then
  echo "This script must be run from the server directory."
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

echo "--- Starting Postgres ---"

cleanup() {
  # Stop the Docker container
  if [[ -n "$(docker ps -q -f name=$DOCKER_CONTAINER_NAME)" ]]; then
    echo "--- Killing Postgres ---"
    docker stop $DOCKER_CONTAINER_NAME > /dev/null
  fi
}
trap cleanup EXIT

processes=$(docker ps -a --format '{{.Names}}')
if [[ $processes == *"$DOCKER_CONTAINER_NAME"* ]]; then
  docker restart $DOCKER_CONTAINER_NAME > /dev/null
else
  docker run -d \
    --name $DOCKER_CONTAINER_NAME \
    -e POSTGRES_USER=test \
    -e POSTGRES_PASSWORD=$PGPASSWORD \
    -p 5432:5432 \
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
if psql -h 0.0.0.0 -p 5432 -U test -d postgres -f ./data/schema.sql 2>&1 | grep error; then
  echo "--- Database setup failed ---"
  exit 1
else
  echo "--- Database setup successful ---"
fi

echo "--- Running REST tests ---"
bun test $@
REST_CODE=$?

exit $REST_CODE
# The exit will invoke the cleanup function
