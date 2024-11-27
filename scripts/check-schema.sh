rootDir=$(pwd)

# Assert that CALL_DIR is the server directory
if [ ! -f "$rootDir/scripts/check-schema.sh" ]; then
  echo "This script must be run from the root directory."
  exit 1
fi

function cleanup() {
  rm -rf $rootDir/migrations
}
trap cleanup EXIT

rm -rf $rootDir/migrations
if ! bun drizzle-kit generate; then
  echo "--- Failed to generate the schema ---" >&2
  exit 1
fi

if diff $rootDir/data/schema.sql $rootDir/migrations/0000_*.sql; then
  echo "--- Schema is up to date ---"
  exit 0
fi

exit 1