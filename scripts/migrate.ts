import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from '../server/src/drizzle';

await migrate(db, { migrationsFolder: './migrations' });
