export PGHOST=0.0.0.0
export PGPORT=5432 
export PGUSER=admin
export PGDB=postgres
export DOCKER_CONTAINER_NAME=ichack_postgres
export PGPASSWORD=rootpasswd

while ! docker exec $DOCKER_CONTAINER_NAME pg_isready -U test > /dev/null; do
  echo "--- Waiting for Postgres to start ---"
  sleep 1
done


psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDB -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO admin; GRANT ALL ON SCHEMA public TO public;" 
psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDB -f data/schema.sql
