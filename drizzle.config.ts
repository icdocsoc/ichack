import { defineConfig } from 'drizzle-kit';

const ca = process.env.PGCA;

export default defineConfig({
  schema: './server/src/*/schema.ts',
  out: './schemas',
  dialect: 'postgresql',
  dbCredentials: {
    user: process.env.PGUSER || 'admin',
    password: process.env.PGPASSWORD || 'rootpasswd',
    database: process.env.PGDB || 'postgres',
    host: process.env.PGHOST || '0.0.0.0',
    port: +(process.env.PGPORT || 5432),
    ssl: ca == undefined || !ca.length ? false : { ca }
  }
});
