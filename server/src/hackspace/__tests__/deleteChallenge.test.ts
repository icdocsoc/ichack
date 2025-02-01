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

const baseRoute = testClient(app).hackspace;

const dummyChallenge: Challenge = {
  name: 'touch grass',
  qtr: 0,
  scr: 0,
  jcr: 0
};

const sessionIds: Partial<Record<Role, string>> = {};

beforeAll(async () => {
  await db.execute(sql`TRUNCATE ${users} CASCADE`);
  await db.execute(sql`TRUNCATE ${userSession} CASCADE`);
  await db.execute(sql`TRUNCATE ${teams} CASCADE`);

  for (const role of roles) {
    const { sessionId } = await createUserWithSession(role, {
      name: 'Honey, the free browser extension',
      email: `${role}@joinhoney.com`,
      password: '4billion'
    });
    sessionIds[role] = sessionId;
  }
});

beforeEach(async () => {
  await db.execute(sql`TRUNCATE ${challenges} CASCADE`);
});

describe('Hackspace Module > DELETE /', () => {
  test('admins can delete challenges', async () => {
    await db.insert(challenges).values(dummyChallenge);

    const res1 = await baseRoute.challenge.$delete(
      { json: { name: dummyChallenge.name } },
      { headers: { Cookie: `auth_session=${sessionIds['admin']}` } }
    );

    expect(res1.ok).toBeTrue();
    const challengesInDb = await db.select().from(challenges);
    expect(challengesInDb).toEqual([]);
  });
  test('non-admins cannot delete challenges', async () => {
    for (const role of roles) {
      if (role == 'admin' || role == 'god') continue;
      const res = await baseRoute.challenge.$delete(
        { json: { name: dummyChallenge.name } },
        { headers: { Cookie: `auth_session=${sessionIds[role]}` } }
      );

      // @ts-expect-error As it's from the middleware.
      expect(res.status).toBe(403);
      expect(res.text()).resolves.toBe(
        'You do not have access to DELETE /api/hackspace/challenge'
      );
    }
  });
});
