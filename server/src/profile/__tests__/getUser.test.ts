import { beforeAll, describe, expect, test } from 'bun:test';
import { profiles, type UserAndProfile, type RawProfile } from '../schema';
import { db } from '../../drizzle';
import { users, userSession } from '../../auth/schema';
import { createUserWithSession } from '../../testHelpers';
import { roles, type Role } from '../../types';
import { testClient } from 'hono/testing';
import app from '../../app';
import { sql } from 'drizzle-orm';
import { qrs } from '../../qr/schema';

const sessionIds: Partial<Record<Role, string>> = {};
const userIds: Partial<Record<Role, string>> = {};
const baseRoute = testClient(app).profile;
const expectedSkeleton = {
  photos_opt_out: false,
  dietary_restrictions: [],
  pronouns: null,
  meals: [false, false, false],
  cvUploaded: false,
  discord_id: null,
  hackspace: null
};
const expectedSearch: Partial<Record<Role, UserAndProfile>> = {};
const sortById = (
  a: RawProfile | UserAndProfile,
  b: RawProfile | UserAndProfile
) => (a.id > b.id ? 1 : -1);

beforeAll(async () => {
  // Insert sample users into the database & sign in as one
  await db.execute(sql`TRUNCATE ${userSession} CASCADE`);
  await db.execute(sql`TRUNCATE ${users} CASCADE`);
  await db.execute(sql`TRUNCATE ${profiles} CASCADE`);
  await db.execute(sql`TRUNCATE ${qrs} CASCADE`);

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
    expectedSearch[role] = {
      id: userId,
      name: toCreate.name,
      email: toCreate.email,
      role: role,
      ...expectedSkeleton
    };

    if (role === 'hacker') {
      await db.insert(qrs).values({
        userId: userId,
        uuid: '00000000-0000-0000-0000-000000000042'
      });
    }
  }
});

describe('Profiles module > GET /', () => {
  test('returns logged in user', async () => {
    const res = await baseRoute.$get(undefined, {
      headers: {
        Cookie: `auth_session=${sessionIds.hacker}`
      }
    });

    expect(res.status).toBe(200);

    const resUser = await res.json();
    expect(resUser).toEqual(expectedSearch['hacker']!);
    expect(resUser).not.toHaveProperty('password');
  });

  test('only authenticated user can get /', async () => {
    const res = await baseRoute.$get(
      {
        json: {}
      },
      {
        headers: {}
      }
    );

    // @ts-expect-error As it's the middleware we're hitting.
    expect(res.status).toBe(403);
    expect(res.text()).resolves.toBe(
      'You do not have access to GET /api/profile'
    );
  });
});

describe('Profiles module > GET /:id', () => {
  test('returns user by ID', async () => {
    const res = await baseRoute[':id'].$get(
      {
        param: { id: userIds.hacker! }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.volunteer}`
        }
      }
    );

    const resUser = (await res.json()) as RawProfile;

    expect(res.status).toBe(200);
    expect(resUser).toEqual(expectedSearch['hacker']!);
  });

  test('only volunteer can get other user', async () => {
    const res = await baseRoute[':id'].$get(
      {
        param: { id: userIds.hacker! }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.hacker}`
        }
      }
    );

    // @ts-expect-error As it's the middleware we're hitting.
    expect(res.status).toBe(403);
    expect(res.text()).resolves.toBe(
      `You do not have access to GET /api/profile/${userIds.hacker!}`
    );

    const res2 = await baseRoute[':id'].$get(
      {
        param: { id: userIds.hacker! }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.hacker}`
        }
      }
    );

    // @ts-expect-error As it's the middleware we're hitting.
    expect(res2.status).toBe(403);
    expect(res2.text()).resolves.toBe(
      `You do not have access to GET /api/profile/${userIds.hacker!}`
    );
  });
});

describe('Profiles module > GET /search', () => {
  test('can search by (partial, case insensitive) name', async () => {
    const res = await baseRoute.search.$get(
      {
        query: {
          name: 'jay'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.volunteer}`
        }
      }
    );

    const resUser = await res.json();

    expect(res.status).toBe(200);
    expect(resUser.sort(sortById)).toEqual(
      Object.values(expectedSearch).sort(sortById)
    );
  });

  test('can search by full email', async () => {
    const res = await baseRoute.search.$get(
      {
        query: {
          email: 'hacker@ic.ac.uk'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.volunteer}`
        }
      }
    );

    const resUser = (await res.json()) as RawProfile[];

    expect(res.status).toBe(200);
    expect(resUser.length).toBe(1);
    expect(resUser[0]).toEqual(expectedSearch['hacker']!);
  });

  test('can search by partial email', async () => {
    const res = await baseRoute.search.$get(
      {
        query: {
          email: 'hacke'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.volunteer}`
        }
      }
    );

    const resUser = (await res.json()) as RawProfile[];

    expect(res.status).toBe(200);
    expect(resUser.length).toBe(1);
    expect(resUser[0]).toMatchObject(expectedSearch['hacker']!);
  });

  test('only volunteer can search other user', async () => {
    const res = await baseRoute.search.$get(
      {
        query: {
          email: 'hacker@ic.ac.uk'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.hacker}`
        }
      }
    );

    // @ts-expect-error As it's the middleware we're hitting.
    expect(res.status).toBe(403);
    expect(res.text()).resolves.toBe(
      'You do not have access to GET /api/profile/search'
    );
  });

  test('minimum length for email/user searches', async () => {
    const res = await baseRoute.search.$get(
      {
        query: {
          name: 'ja'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.volunteer!}`
        }
      }
    );

    // @ts-expect-error from zod middleware
    expect(res.status).toBe(400);
    expect(res.text()).resolves.toBe("'name' is too small");

    const res2 = await baseRoute.search.$get(
      {
        query: {
          email: 'moha'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.volunteer!}`
        }
      }
    );

    // @ts-expect-error from zod middleware
    expect(res2.status).toBe(400);
    expect(res2.text()).resolves.toBe("'email' is too small");
  });
});
