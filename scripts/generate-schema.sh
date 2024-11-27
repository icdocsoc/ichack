rootDir=$(pwd)

# Assert that CALL_DIR is the server directory
if [ ! -f "$rootDir/scripts/generate-schema.sh" ]; then
  echo "This script must be run from the root directory."
  exit 1
fi

cleanup() {
  rm -rf $rootDir/migrations
}
trap cleanup EXIT

shouldGenerate=0
schemas=$(echo $rootDir/server/src/**/scehma.ts)
for schema in $schemas; do
  if [ ! -f "$rootDir/data/schema.sql" ] || [ "$schema" -nt "$rootDir/data/schema.sql" ]; then
    echo "--- Schema is out of date ---"
    shouldGenerate=1
    break
  fi
done

rm -rf $rootDir/migrations
if ! bun drizzle-kit generate; then
  echo "--- Failed to generate the schema ---" >&2
  exit 1
fi

mv $rootDir/migrations/0000_*.sql $rootDir/data/schema.sql

echo "--- Schema generated successfully ---"