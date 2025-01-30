import { SQL, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { Pool } from 'pg';

const ca = process.env.PGCA;

export const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDB,
  password: process.env.PGPASSWORD,
  port: +(process.env.PGPORT || 5432),
  ssl: ca
    ? {
        rejectUnauthorized: true,
        ca
      }
    : undefined
});

export function lower(email: AnyPgColumn): SQL {
  return sql`lower(${email})`;
}

export const db = drizzle(pool);
