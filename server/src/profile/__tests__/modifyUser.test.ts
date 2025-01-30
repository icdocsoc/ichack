import { beforeAll, describe, expect, test } from 'bun:test';
import { profiles, type RawProfile } from '../schema';
import { roles, type Role } from '../../types';
import { testClient } from 'hono/testing';
import app from '../../app';
import { db } from '../../drizzle';
import { users, userSession } from '../../auth/schema';
import { createUserWithSession } from '../../testHelpers';
import { eq, sql } from 'drizzle-orm';
import { sha256 } from 'hono/utils/crypto';
import { qrs } from '../../qr/schema';
import { adminMeta } from '../../admin/schema';

const sessionIds: Partial<Record<Role, string>> = {};
const userIds: Partial<Record<Role, string>> = {};
const baseRoute = testClient(app).profile;
const expectedSkeleton = {
  photos_opt_out: false,
  dietary_restrictions: [],
  pronouns: null,
  meals: [false, false, false],
  password: 'securepass',
  cvUploaded: false
};
const expectedUsers: Partial<Record<Role, RawProfile>> = {};

beforeAll(async () => {
  // Insert sample users into the database & sign in as one
  await db.execute(sql`TRUNCATE ${userSession} CASCADE`);
  await db.execute(sql`TRUNCATE ${users} CASCADE`);
  await db.execute(sql`TRUNCATE ${profiles} CASCADE`);
  await db.execute(sql`TRUNCATE ${qrs} CASCADE`);
  await db.execute(sql`TRUNCATE ${adminMeta} CASCADE`);

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
    expectedUsers[role] = {
      id: userId,
      ...expectedSkeleton
    };

    if (role === 'hacker') {
      await db.insert(qrs).values({
        userId: userId,
        uuid: '00000000-0000-0000-0000-000000000042'
      });
    }
  }

  await db.insert(adminMeta).values({ mealNumber: 0, showCategories: false });
});

describe('Profiles module > PUT /', () => {
  test('can update own profile', async () => {
    const newPronouns = 'she/her';
    let res = await baseRoute.$put(
      {
        json: {
          pronouns: newPronouns
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.hacker}`
        }
      }
    );

    let userInDb = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userIds.hacker!));
    expect(res.status).toBe(200);
    expect(userInDb[0]!.pronouns).toBe(newPronouns);

    const newDietaryRestrictions = ['halal', 'blue cheese'];
    res = await baseRoute.$put(
      {
        json: {
          photos_opt_out: true,
          dietary_restrictions: newDietaryRestrictions
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.hacker}`
        }
      }
    );

    userInDb = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userIds.hacker!));
    expect(res.status).toBe(200);
    expect(userInDb[0]!.pronouns).toBe(newPronouns);
    expect(userInDb[0]!.photos_opt_out).toBe(true);
    expect(userInDb[0]!.dietary_restrictions).toEqual(newDietaryRestrictions);
  });
});

describe('Profile module > PUT /meals', () => {
  test('volunteer can update meals', async () => {
    // { userId: string }
    let res = await baseRoute.meal.$put(
      {
        json: {
          userId: expectedUsers.hacker!.id
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.volunteer}`
        }
      }
    );

    let userInDb = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userIds.hacker!));

    expect(res.status).toBe(200);
    expect(userInDb[0]!.meals[0]).toBeTrue();
  });

  test('only volunteer can update meals', async () => {
    let res = await baseRoute.meal.$put(
      {
        json: {
          userId: expectedUsers.hacker!.id
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.hacker}`
        }
      }
    );

    // @ts-expect-error code is from middleware
    expect(res.status).toBe(403);
    expect(res.text()).resolves.toBe(
      // @ts-ignore error message is from middleware
      'You do not have access to PUT /api/profile/meal'
    );
  });
});

describe('Profile module > DELETE /meals', () => {
  test('admin can update meals', async () => {
    await db
      .update(profiles)
      .set({ meals: [true, false, false] })
      .where(eq(profiles.id, userIds.hacker!));

    // { userId: string }
    let res = await baseRoute.meal.$delete(
      {
        json: {
          userId: expectedUsers.hacker!.id,
          mealNum: 0
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.admin}`
        }
      }
    );

    let userInDb = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userIds.hacker!));

    expect(res.status).toBe(200);
    expect(userInDb[0]!.meals[0]).toBeFalse();
  });

  test('only volunteer can update meals', async () => {
    let res = await baseRoute.meal.$delete(
      {
        json: {
          userId: expectedUsers.hacker!.id,
          mealNum: 0
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.volunteer}`
        }
      }
    );

    // @ts-expect-error code is from middleware
    expect(res.status).toBe(403);
    expect(res.text()).resolves.toBe(
      // @ts-ignore error message is from middleware
      'You do not have access to DELETE /api/profile/meal'
    );
  });
});

describe.skip('Profiles module > GET/POST /cv', () => {
  test.skip('can upload & download own cv', async () => {
    let res = await baseRoute.cv.$get(undefined, {
      headers: {
        Cookie: `auth_session=${sessionIds.hacker}`
      }
    });
    expect(res.status).toBe(400);
    // TODO add a test for the error message

    const cvPdf = Bun.file('src/profile/__tests__/cv.pdf');
    res = await baseRoute.cv.$post(
      {
        body: cvPdf
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.hacker}`,
          'Content-Type': 'application/pdf'
        }
      }
    );
    expect(res.status).toBe(200);

    res = await baseRoute.cv.$get(undefined, {
      headers: {
        Cookie: `auth_session=${sessionIds.hacker}`
      }
    });
    let downloadedPdf = await res.blob();

    expect(res.status).toBe(200);
    expect(downloadedPdf).toBe(cvPdf);
  });
});

describe('Profiles module > GET /discord', () => {
  test('redirects if no state', async () => {
    const res = await baseRoute.discord.$get(
      {
        query: {
          code: undefined,
          state: undefined
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.hacker!}`
        }
      }
    );

    // Expect a redirect.
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toMatch(
      'https://discord.com/oauth2/authorize?'
    );
  });

  test('attempts to add to server if state & code', async () => {
    const res = await baseRoute.discord.$get(
      {
        query: {
          code: 'false code',
          state: (await sha256(sessionIds.hacker!))!
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.hacker!}`
        }
      }
    );

    // Expect a failure, as the Discord routes won't work in tests
    // due to an invalid code being provided.
    expect(res.status).toBe(500);
    // TODO I don't know what the error message is.
    // expect(await res.text()).toMatch('Error adding to Discord server');
  });

  test('invalid state returns error', async () => {
    const res = await baseRoute.discord.$get(
      {
        query: {
          code: 'false code',
          state: 'lala land'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.hacker!}`
        }
      }
    );

    expect(res.status).toBe(400);
    expect(res.text()).resolves.toBe('Invalid request.');
  });

  test.skip('can link discord', async () => {
    // TODO: Look into testing OAuth2, as this requires an expiring token from Discord that I don't believe
    // I can automatically request (not within their TOS, at least).
  });
});

describe('Profiles module > GET /ws', () => {
  test.skip('websocket gives current profile details & updates', async () => {
    // TODO: Pending Webhook PR
  });
});
