import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from '../src/drizzle';

await migrate(db, { migrationsFolder: './migrations' });
