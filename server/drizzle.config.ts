import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './db/schema/*.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: 'postgres',
    user: 'admin',
    password: 'rootpasswd',
    database: 'ichack25'
  }
});
