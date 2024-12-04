import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './server/src/*/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: '0.0.0.0',
    user: 'admin',
    password: 'rootpasswd',
    database: 'postgres'
  }
});
