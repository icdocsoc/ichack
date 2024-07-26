CALL_DIR=$(pwd)

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

export PGPASSWORD=test

processes=$(docker ps -a --format '{{.Names}}')
if [[ $processes == *"postgres_test"* ]]; then
  docker restart postgres_test > /dev/null
else
  docker run -d \
    --name postgres_test \
    -e POSTGRES_USER=test \
    -e POSTGRES_PASSWORD=$PGPASSWORD \
    -p 5432:5432 \
    postgres:16 > /dev/null
fi

while ! docker exec postgres_test pg_isready -U test > /dev/null; do
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

echo "--- Running tests ---"
bun test $@
RESULT=$?

echo "--- Killing Postgres ---"
docker stop postgres_test > /dev/null

exit $RESULT