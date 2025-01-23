import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { profiles, type Profile, type SelectedProfile } from '../schema';
import { db } from '../../drizzle';
import { users, userSession, userToken } from '../../auth/schema';
import { createUserWithSession, tomorrow, yesterday } from '../../testHelpers';
import { roles, type Role } from '../../types';
import { testClient } from 'hono/testing';
import app from '../../app';
import { eq, sql } from 'drizzle-orm';
import { verify } from 'argon2';
import { hashOptions } from '../../auth/lucia';

const sessionIds: Partial<Record<Role, string>> = {};
const userIds: Partial<Record<Role, string>> = {};
const baseRoute = testClient(app).profile;
const expectedSkeleton = {
  photos_opt_out: false,
  dietary_restrictions: [],
  pronouns: null,
  meals: [false, false, false],
  cvUploaded: false
};
const expectedGet: Partial<Record<Role, SelectedProfile>> = {};
const expectedSearch: Partial<Record<Role, Profile>> = {};

beforeAll(async () => {
  // Insert sample users into the database & sign in as one
  await db.execute(sql`TRUNCATE ${userSession} CASCADE`);
  await db.execute(sql`TRUNCATE ${users} CASCADE`);
  await db.execute(sql`TRUNCATE ${profiles} CASCADE`);

  for (const role of roles) {
    const toCreate = {
      name: `Jay ${role}`,
      email: `${role}@ic.ac.uk`,
      password: 'securepass'
    };
    const { userId, sessionId } = await createUserWithSession(role, toCreate);
    sessionIds[role] = sessionId;
    userIds[role] = userId;

    await db.insert(profiles).values({
      id: userId,
      ...expectedSkeleton
    });
    expectedGet[role] = {
      id: userId,
      ...expectedSkeleton
    };
    expectedSearch[role] = {
      name: toCreate.name,
      email: toCreate.email,
      role: role,
      ...expectedGet[role]
    };
  }
});

describe('Profiles module > POST /register', () => {
  const partialProfile = {
    photos_opt_out: false,
    dietary_restrictions: ['halal', 'green'],
    pronouns: 'she/they'
  };

  const postBody = {
    // This is a randomly generated password, don't worry.
    password: '6N78^yVpGhg2@o*&',
    cv: undefined,
    tShirtSize: 'M' as const,
    ...partialProfile
  };

  const expectedInDb = {
    meals: [false, false, false],
    ...partialProfile
  };

  test('can post with valid token, consumes token', async () => {
    // Delete profile as `/register` is for those with no profile
    const deleted = await db
      .delete(profiles)
      .where(eq(profiles.id, userIds.hacker!!))
      .returning();

    // Insert token for hacker
    const token = 'funnyLittleToken';
    await db.insert(userToken).values({
      id: token,
      userId: userIds.hacker!!,
      expiresAt: tomorrow,
      type: 'registration_link'
    });

    const res = await baseRoute.register.$post(
      {
        query: {
          token: token
        },
        form: { registrationDetails: JSON.stringify(postBody) }
      },
      undefined
    );

    // To ensure the token is consumed.
    const failRes = await baseRoute.register.$post(
      {
        query: {
          token: token
        },
        form: { registrationDetails: JSON.stringify(postBody) }
      },
      undefined
    );

    // Verify return is correct & ensure it was added into profile
    // Returning delete as we want to return the original profile at the end of tests.
    expect(res.status).toBe(200);
    const profileInDb = await db
      .delete(profiles)
      .where(eq(profiles.id, userIds.hacker!!))
      .returning();
    expect(profileInDb.length).toBe(1);
    expect(profileInDb[0]).toMatchObject(expectedInDb);

    // Verify password is updated
    const userInDb = await db
      .select()
      .from(users)
      .where(eq(users.id, userIds.hacker!!));
    expect(
      await verify(userInDb[0]!.password!!, postBody.password, hashOptions)
    ).toBeTrue();

    // Verify token is consumed
    expect(failRes.status).toBe(403);
    expect(failRes.text()).resolves.toBe('Invalid token.');
    const tokenInDb = await db
      .select()
      .from(userToken)
      .where(eq(userToken.userId, userIds.hacker!!));
    expect(tokenInDb.length).toBe(0);

    // Return deleted profile & delete token
    await db.insert(profiles).values(deleted);
    await db.delete(userToken).where(eq(userToken.id, token));
  });

  test('cannot post with invalid token', async () => {
    const res = await baseRoute.register.$post(
      {
        query: {
          token: 'invalid token'
        },
        form: { registrationDetails: JSON.stringify(postBody) }
      },
      undefined
    );

    // Verify return is correct
    expect(res.status).toBe(403);
    expect(res.text()).resolves.toBe('Invalid token.');
  });

  test('cannot post with an expired token', async () => {
    // Delete profile as `/register` is for those with no profile
    const deleted = await db
      .delete(profiles)
      .where(eq(profiles.id, userIds.hacker!!))
      .returning();

    // Insert expired token for hacker
    const token = 'funnyLittleToken';
    await db.insert(userToken).values({
      id: token,
      userId: userIds.hacker!!,
      expiresAt: yesterday,
      type: 'registration_link'
    });

    const res = await baseRoute.register.$post(
      {
        query: {
          token: token
        },
        form: { registrationDetails: JSON.stringify(postBody) }
      },
      undefined
    );

    // Verify return is correct
    expect(res.status).toBe(403);
    expect(res.text()).resolves.toBe('Token has expired.');

    // Return deleted profile & delete token
    await db.insert(profiles).values(deleted);
    await db.delete(userToken).where(eq(userToken.id, token));
  });

  test('cannot post with wrong token type', async () => {
    // Delete profile as `/register` is for those with no profile
    const deleted = await db
      .delete(profiles)
      .where(eq(profiles.id, userIds.hacker!!))
      .returning();

    // Insert expired token for hacker
    const token = 'funnyLittleToken';
    await db.insert(userToken).values({
      id: token,
      userId: userIds.hacker!!,
      expiresAt: yesterday,
      type: 'forgot_password'
    });

    const res = await baseRoute.register.$post(
      {
        query: {
          token: token
        },
        form: { registrationDetails: JSON.stringify(postBody) }
      },
      undefined
    );

    // Verify return is correct
    expect(res.status).toBe(403);
    expect(res.text()).resolves.toBe('Invalid token.');

    // Return deleted profile & delete token
    await db.insert(profiles).values(deleted);
    await db.delete(userToken).where(eq(userToken.id, token));
  });

  test('cannot post if signed in', async () => {
    // Delete profile as `/register` is for those with no profile
    const deleted = await db
      .delete(profiles)
      .where(eq(profiles.id, userIds.hacker!!))
      .returning();

    // Insert expired token for hacker
    const token = 'funnyLittleToken';
    await db.insert(userToken).values({
      id: token,
      userId: userIds.hacker!!,
      expiresAt: tomorrow,
      type: 'registration_link'
    });

    const res = await baseRoute.register.$post(
      {
        query: {
          token: token
        },
        form: { registrationDetails: JSON.stringify(postBody) }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.hacker!!}`
        }
      }
    );

    // Verify return is correct
    expect(res.status).toBe(400);
    expect(res.text()).resolves.toBe('You have already registered.');

    // Return deleted profile & delete token
    await db.insert(profiles).values(deleted);
    await db.delete(userToken).where(eq(userToken.id, token));
  });
});
