import { mock } from 'bun:test';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const mockPool = new Pool({
  user: 'test',
  host: '0.0.0.0',
  database: 'test',
  password: 'test',
  port: 5432
});

const mockDb = drizzle(mockPool);

mock.module('../drizzle', () => ({
  pool: mockPool,
  db: mockDb
}));
