import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { userSession, users } from './schema';
import { Lucia, TimeSpan } from 'lucia';
import { db } from '../drizzle';
import { hash, type Options } from 'argon2';
import { generateRandomString } from '../utils';
import { roles } from '../types';

const adapter = new DrizzlePostgreSQLAdapter(db, userSession, users);

export const lucia = new Lucia(adapter, {
  sessionExpiresIn: new TimeSpan(1, 'd'),
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === 'production'
    }
  },
  getUserAttributes(databaseUserAttributes) {
    return {
      role: databaseUserAttributes.role,
      email: databaseUserAttributes.email
    };
  }
});

export const hashOptions: Options = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
  hashLength: 32
};

export const getDummyPassword = async (): Promise<string> => {
  const randomPassword = generateRandomString(12);
  return await hash(randomPassword, hashOptions);
};

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
  interface DatabaseUserAttributes {
    role: (typeof roles)[number];
    email: string;
  }
}
