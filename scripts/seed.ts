import { hash } from 'argon2';
import { db } from '../server/src/drizzle';
import { users } from '../server/src/auth/schema';
import { generateIdFromEntropySize } from 'lucia';
import { hashOptions } from '../server/src/auth/lucia';
import { profiles, type SelectedProfile } from '~~/server/src/profile/schema';

const godUser1 = {
  id: generateIdFromEntropySize(16),
  name: 'Nishant Aanjaney Jalan',
  email: 'nj421@ic.ac.uk',
  password: await hash('Pass#1234', hashOptions),
  role: 'god',
  pronouns: 'he/him'
} as const;

const godProfile = {
  id: godUser1.id,
  photos_opt_out: false,
  dietary_restrictions: ['dinosaurs'],
  allergies: ['children'],
  pronouns: 'they/them'
};

await db.insert(users).values(godUser1);
await db.insert(profiles).values(godProfile);
