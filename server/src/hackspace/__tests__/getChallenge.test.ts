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

const dummyChallenge = {
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
  await db.execute(sql`TRUNCATE ${challenges} CASCADE`);

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

describe('Hackspace Module > GET /', () => {
  test('sum is calculated correctly', async () => {
    const expectedTotals = {
      jcr: 0,
      qtr: 0,
      scr: 0
    };

    await db.insert(challenges).values({
      name: 'touch grass',
      qtr: 12,
      scr: 3,
      jcr: 1
    });

    expectedTotals.qtr += 12;
    expectedTotals.scr += 3;
    expectedTotals.jcr += 1;

    await db.insert(challenges).values({
      name: 'touch grass 2: electric boogaloo',
      qtr: 1,
      scr: 2,
      jcr: 3
    });

    expectedTotals.qtr += 1;
    expectedTotals.scr += 2;
    expectedTotals.jcr += 3;

    const res = await baseRoute.scores.$get(undefined, {
      headers: { Cookie: `auth_session=${sessionIds.hacker}` }
    });

    expect(res.status).toBe(200);

    const resJson = await res.json();

    expect(resJson).toEqual(expectedTotals);
  });

  test('anyone can get challenges', async () => {
    await db.insert(challenges).values(dummyChallenge);

    const res = await baseRoute.challenges.$get({});

    expect(res.status).toBe(200);

    const resJson = await res.json();

    expect(resJson).toEqual([dummyChallenge]);
  });
});
