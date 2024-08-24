callDir=$(pwd)

function cleanup() {
  rm -rf $callDir/migrations
}
trap cleanup EXIT

# Assert that CALL_DIR is the server directory
if [ ! -f "$callDir/scripts/testServer.sh" ]; then
  echo "This script must be run from the server directory."
  exit 1
fi

rm -rf $callDir/migrations
if ! bunx drizzle-kit generate; then
  echo "--- Failed to generate the schema ---" >&2
  exit 1
fi

if diff $callDir/data/schema.sql $callDir/migrations/0000_*.sql; then
  echo "--- Schema is up to date ---"
  exit 0
fi

exit 1