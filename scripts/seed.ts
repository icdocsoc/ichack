import { hash } from 'argon2';
import { db } from '../server/src/drizzle';
import { users, userToken } from '../server/src/auth/schema';
import { generateIdFromEntropySize } from 'lucia';
import { hashOptions } from '../server/src/auth/lucia';
import { profiles } from '~~/server/src/profile/schema';
import { qrs } from '~~/server/src/qr/schema';
import { adminMeta } from '~~/server/src/admin/schema';
import { userHackspace } from '~~/server/src/hackspace/schema';

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

const hackerUserQr = {
  userId: hackerUser.id,
  uuid: '12345678-1234-1234-1234-123456789012'
};

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
  password: await hash('Pass#1234', hashOptions),
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
await db.insert(qrs).values([hackerUserQr]);
await db.insert(adminMeta).values({ mealNumber: 0, showCategories: false });
