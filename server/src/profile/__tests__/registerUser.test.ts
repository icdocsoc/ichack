import { beforeAll, describe, expect, test } from 'bun:test';
import { profiles, type Profile, type SelectedProfile } from '../schema';
import { db } from '../../drizzle';
import { users, userSession, userToken } from '../../auth/schema';
import { createUserWithSession, tomorrow, yesterday } from '../../testHelpers';
import { roles } from '../../types';
import { testClient } from 'hono/testing';
import app from '../../app';
import { eq, sql } from 'drizzle-orm';
import { verify } from 'argon2';
import { hashOptions } from '../../auth/lucia';

const sessionIds: Partial<Record<(typeof roles)[number], string>> = {};
const userIds: Partial<Record<(typeof roles)[number], string>> = {};
const baseRoute = testClient(app).profile;
const expectedSkeleton = {
  photos_opt_out: false,
  dietary_restrictions: [],
  allergies: [],
  pronouns: null,
  meals: [false, false, false]
};
const expectedGet: Partial<Record<(typeof roles)[number], SelectedProfile>> =
  {};
const expectedSearch: Partial<Record<(typeof roles)[number], Profile>> = {};

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

describe('Profiles module > GET /register', () => {
  test('can get with valid token, does not consume token', async () => {
    // Delete profile as `/register` is for those with no profile
    const deleted = await db
      .delete(profiles)
      .where(eq(profiles.id, userIds.hacker!!))
      .returning();
    const expected = await db
      .select()
      .from(users)
      .where(eq(users.id, userIds.hacker!!));

    // Insert token for hacker
    const token = 'funnyLittleToken';
    await db.insert(userToken).values({
      id: token,
      userId: userIds.hacker!!,
      expiresAt: tomorrow,
      type: 'registration_link'
    });

    // GET twice, to ensure token is not consumed.
    await baseRoute.register.$get(
      {
        query: {
          token: token
        }
      },
      undefined
    );

    const res = await baseRoute.register.$get(
      {
        query: {
          token: token
        }
      },
      undefined
    );

    expect(res.status).toBe(200);
    const body = await res.json();

    // Verify return is correct
    expect(body.name).toBe(expected[0].name);
    expect(body.email).toBe(expected[0].email);
    expect(body.role).toBe(expected[0].role);

    // Return deleted profile & delete token
    await db.insert(profiles).values(deleted);
    await db.delete(userToken).where(eq(userToken.userId, userIds.hacker!!));
  });

  test('cannot get with invalid token', async () => {
    const res = await baseRoute.register.$get(
      {
        query: {
          token: 'invalid token'
        }
      },
      undefined
    );

    // Verify return is correct
    expect(res.status).toBe(403);
  });

  test('cannot get with an expired token', async () => {
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

    const res = await baseRoute.register.$get(
      {
        query: {
          token: token
        }
      },
      undefined
    );

    // Verify return is correct
    expect(res.status).toBe(403);

    // Return deleted profile & delete token
    await db.insert(profiles).values(deleted);
    await db.delete(userToken).where(eq(userToken.userId, userIds.hacker!!));
  });

  test('cannot get with wrong token type', async () => {
    // Delete profile as `/register` is for those with no profile
    const deleted = await db
      .delete(profiles)
      .where(eq(profiles.id, userIds.hacker!!))
      .returning();

    // Insert wrong token for hacker
    const token = 'funnyLittleToken';
    await db.insert(userToken).values({
      id: token,
      userId: userIds.hacker!!,
      expiresAt: tomorrow,
      type: 'forgot_password'
    });

    const res = await baseRoute.register.$get(
      {
        query: {
          token: token
        }
      },
      undefined
    );

    // Verify return is correct
    expect(res.status).toBe(403);

    // Return deleted profile & delete token
    await db.insert(profiles).values(deleted);
    await db.delete(userToken).where(eq(userToken.userId, userIds.hacker!!));
  });

  test('cannot get if signed in', async () => {
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

    const res = await baseRoute.register.$get(
      {
        query: {
          token: token
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.hacker!!}`
        }
      }
    );

    // Verify return is correct
    expect(res.status).toBe(400);

    // Return deleted profile & delete token
    await db.insert(profiles).values(deleted);
    await db.delete(userToken).where(eq(userToken.userId, userIds.hacker!!));
  });
});

describe('Profiles module > POST /register', () => {
  const partialProfile = {
    photos_opt_out: false,
    dietary_restrictions: ['halal', 'green'],
    allergies: [],
    pronouns: 'she/they'
  };

  const postBody = {
    // This is a randomly generated password, don't worry.
    password: '6N78^yVpGhg2@o*&',
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
        json: postBody
      },
      undefined
    );

    // To ensure the token is consumed.
    const failRes = await baseRoute.register.$post(
      {
        query: {
          token: token
        },
        json: postBody
      },
      undefined
    );

    // Verify return is correct & ensure it was added into profile
    // Returning delete as we want to return the original profile at the end of tests.
    expect(res.status).toBe(204);
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
      await verify(userInDb[0].password!!, postBody.password, hashOptions)
    ).toBeTrue();

    // Verify token is consumed
    expect(failRes.status).toBe(403);
    const tokenInDb = await db
      .select()
      .from(userToken)
      .where(eq(userToken.userId, userIds.hacker!!));
    expect(tokenInDb.length).toBe(0);

    // Return deleted profile & delete token
    await db.insert(profiles).values(deleted);
  });

  test('cannot post with invalid token', async () => {
    const res = await baseRoute.register.$post(
      {
        query: {
          token: 'invalid token'
        },
        json: postBody
      },
      undefined
    );

    // Verify return is correct
    expect(res.status).toBe(403);
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
        json: postBody
      },
      undefined
    );

    // Verify return is correct
    expect(res.status).toBe(403);

    // Return deleted profile & delete token
    await db.insert(profiles).values(deleted);
    await db.delete(userToken).where(eq(userToken.userId, userIds.hacker!!));
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
        json: postBody
      },
      undefined
    );

    // Verify return is correct
    expect(res.status).toBe(403);

    // Return deleted profile & delete token
    await db.insert(profiles).values(deleted);
    await db.delete(userToken).where(eq(userToken.userId, userIds.hacker!!));
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
        json: postBody
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.hacker!!}`
        }
      }
    );

    // Verify return is correct
    expect(res.status).toBe(400);

    // Return deleted profile & delete token
    await db.insert(profiles).values(deleted);
    await db.delete(userToken).where(eq(userToken.userId, userIds.hacker!!));
  });
});
