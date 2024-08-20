import type { PoolClient } from 'pg';

export const setupNotification = async (client: PoolClient, table: string) => {
  await client.query(`
    CREATE OR REPLACE FUNCTION ${table}_notify()
    RETURNS trigger AS $$
    BEGIN
      PERFORM pg_notify('${table}_updates', row_to_json(NEW)::text);
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;`);
  await client.query(`
    CREATE OR REPLACE TRIGGER ${table}_update
      AFTER INSERT OR UPDATE OR DELETE ON ${table}
      FOR EACH ROW
    EXECUTE PROCEDURE ${table}_notify();`);
};
