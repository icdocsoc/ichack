import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from '../src/etc/db';

await migrate(db, { migrationsFolder: './drizzle' });
