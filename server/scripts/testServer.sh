CALL_DIR=$(pwd)
testCmd=""
schemaFile=""
if [ -f "$CALL_DIR/server/scripts/testServer.sh" ]; then
  testCmd="test:server"
  schemaFile="$CALL_DIR/server/data/schema.sql"
elif [ -f "$CALL_DIR/scripts/testServer.sh" ]; then
  testCmd="test"
  schemaFile="$CALL_DIR/data/schema.sql"
else
  echo "This script must be run from the root directory or server directory."
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

processes=$(docker ps -a --format '{{.Names}}')

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

while ! docker exec postgres_test pg_isready -U test; do
  sleep 1
done
psql -h 0.0.0.0 -p 5432 -U test -d postgres -f $schemaFile

echo "--- Running tests ---"
bun run $testCmd

echo "--- Killing Postgres ---"
docker kill postgres_test > /dev/null