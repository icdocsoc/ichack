import { hash } from 'argon2';
import { db } from '../server/src/drizzle';
import { users, userToken } from '../server/src/auth/schema';
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
  pronouns: 'they/them',
  cvUploaded: false
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
  pronouns: 'he/him',
  cvUploaded: false
};

const registerUser = {
  id: generateIdFromEntropySize(16),
  name: 'Jay Silver',
  email: 'jay@ic.ac.uk',
  password: null,
  role: 'hacker'
} as const;

const expires = new Date();
expires.setDate(expires.getDate() + 100);
const registerToken = {
  id: generateIdFromEntropySize(16),
  userId: registerUser.id,
  expiresAt: expires,
  type: 'registration_link' as const
} as const;

await db.insert(users).values([godUser1, hackerUser, registerUser]);
await db.insert(profiles).values([godProfile, hackerProfile]);
await db.insert(userToken).values([registerToken]);
console.log(`registration token: ${registerToken.id}`);
