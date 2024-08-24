callDir=$(pwd)

# Assert that CALL_DIR is the server directory
if [ ! -f "$callDir/scripts/testServer.sh" ]; then
  echo "This script must be run from the server directory."
  exit 1
fi

cleanup() {
  rm -rf $callDir/migrations
}
trap cleanup EXIT

shouldGenerate=0
schemas=$(echo $callDir/src/**/scehma.ts)
for schema in $schemas; do
  if [ ! -f "$callDir/data/schema.sql" ] || [ "$schema" -nt "$callDir/data/schema.sql" ]; then
    echo "--- Schema is out of date ---"
    shouldGenerate=1
    break
  fi
done

rm -rf $callDir/migrations
if ! bunx drizzle-kit generate; then
  echo "--- Failed to generate the schema ---" >&2
  exit 1
fi

mv $callDir/migrations/0000_*.sql $callDir/data/schema.sql

echo "--- Schema generated successfully ---"