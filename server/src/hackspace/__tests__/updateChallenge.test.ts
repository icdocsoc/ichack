import { beforeAll, beforeEach, describe, expect, test } from 'bun:test';
import { db } from '../../drizzle';
import { createChallenge, challenges } from '../schema';
import { hackspaces, roles, type Hackspace, type Role } from '../../types';
import { testClient } from 'hono/testing';
import { eq, sql } from 'drizzle-orm';
import { users, userSession } from '../../auth/schema';
import { createUserWithSession } from '../../testHelpers';
import app from '../../app';
import { teams } from '../../team/schema';
import type { Challenge } from '~~/shared/types';
import { qrs } from '../../qr/schema';

const baseRoute = testClient(app).hackspace;

const dummyChallenge: Challenge = {
  name: 'touch grass',
  qtr: 0,
  jcr: 0,
  scr: 0
};

const sessionIds: Partial<Record<Role, string>> = {};

beforeAll(async () => {
  await db.execute(sql`TRUNCATE ${users} CASCADE`);
  await db.execute(sql`TRUNCATE ${userSession} CASCADE`);
  await db.execute(sql`TRUNCATE ${teams} CASCADE`);

  let i = 0;
  for (const role of roles) {
    const { userId, sessionId } = await createUserWithSession(role, {
      name: 'Honey, the free browser extension',
      email: `${role}@joinhoney.com`,
      password: '4billion'
    });
    sessionIds[role] = sessionId;

    await db.insert(qrs).values({
      userId: userId,
      uuid: `0000${i}`
    });
    i++;
  }
});

beforeEach(async () => {
  await db.execute(sql`TRUNCATE ${challenges} CASCADE`);
});

describe('Hackspace Module > POST /', () => {
  test('non-admins cannot post challenges', async () => {
    for (const role of roles) {
      if (role == 'admin' || role == 'god') continue;
      const res = await baseRoute.challenge.$put(
        { json: dummyChallenge },
        { headers: { Cookie: `auth_session=${sessionIds[role]}` } }
      );

      // @ts-expect-error As it's from the middleware.
      expect(res.status).toBe(403);
    }
  });

  test('cannot post same name multiple times', async () => {
    const res = await baseRoute.challenge.$post(
      {
        json: dummyChallenge
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.admin!}`
        }
      }
    );

    expect(res.status).toBe(201);

    const dbRes = await db.select().from(challenges);
    expect(dbRes.length).toBe(1);
    expect(dbRes[0] === dummyChallenge);

    const failedRes = await baseRoute.challenge.$post(
      { json: dummyChallenge },
      { headers: { Cookie: `auth_session=${sessionIds['admin']}` } }
    );

    expect(failedRes.status).toBe(409);
  });
});

describe('Hackspace Module > PUT /', () => {
  test('can update challenges', async () => {
    await db.insert(challenges).values(dummyChallenge);

    const res = await baseRoute.challenge.$put(
      {
        json: {
          name: dummyChallenge.name,
          qtr: 1
        }
      },
      { headers: { Cookie: `auth_session=${sessionIds.admin!}` } }
    );

    expect(res.status).toBe(201);

    const dbRes = await db
      .select()
      .from(challenges)
      .where(eq(challenges.name, dummyChallenge.name));

    expect(dbRes.length).toBe(1);
    expect(dbRes[0]!.qtr).toBe(1);
  });

  test('cannot update non-existent challenges', async () => {
    const res = await baseRoute.challenge.$put(
      {
        json: {
          name: 'this challenge does not exist',
          qtr: 1
        }
      },
      { headers: { Cookie: `auth_session=${sessionIds.admin!}` } }
    );

    expect(res.status).toBe(404);
  });
});
