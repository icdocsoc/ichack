import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/*/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: 'postgres',
    user: 'admin',
    password: 'rootpasswd',
    database: 'ichack25'
  }
});
