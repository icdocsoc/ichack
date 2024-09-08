import { hash } from 'argon2';
import { db } from '../src/drizzle';
import { users } from '../src/auth/schema';
import { generateIdFromEntropySize } from 'lucia';
import { hashOptions } from '../src/auth/lucia';

const godUser1 = {
  id: generateIdFromEntropySize(16),
  name: 'Nishant Aanjaney Jalan',
  email: 'nj421@ic.ac.uk',
  password: await hash('Pass#1234', hashOptions),
  role: 'god',
  pronouns: 'he/him'
} as const;

await db.insert(users).values(godUser1);
