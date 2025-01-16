import { hash } from 'argon2';
import { db } from '../server/src/drizzle';
import { users } from '../server/src/auth/schema';
import { generateIdFromEntropySize } from 'lucia';
import { hashOptions } from '../server/src/auth/lucia';
import { profiles } from '~~/server/src/profile/schema';

const godUser1 = {
  id: generateIdFromEntropySize(16),
  name: 'Nishant Aanjaney Jalan',
  email: 'nj421@ic.ac.uk',
  password: await hash('Pass#1234', hashOptions),
  role: 'god'
} as const;

const godProfile = {
  id: godUser1.id,
  photos_opt_out: false,
  dietary_restrictions: ['dinosaurs'],
  allergies: ['children'],
  pronouns: 'they/them'
};

const hackerUser = {
  id: generateIdFromEntropySize(16),
  name: 'Nishant the Hacker II',
  email: 'nishant@hacker.co.uk',
  password: await hash('Pass#1234', hashOptions),
  role: 'hacker'
} as const;

const hackerProfile = {
  id: hackerUser.id,
  photos_opt_out: false,
  dietary_restrictions: ['dinosaurs'],
  allergies: ['children'],
  pronouns: 'he/him'
};

await db.insert(users).values([godUser1, hackerUser]);
await db.insert(profiles).values([godProfile, hackerProfile]);
