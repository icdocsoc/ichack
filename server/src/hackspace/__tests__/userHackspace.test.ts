import { testClient } from 'hono/testing';
import app from '../../app';
import { beforeAll, beforeEach, describe, expect, test } from 'bun:test';
import { db } from '../../drizzle';
import { eq, sql } from 'drizzle-orm';
import { users, userSession } from '../../auth/schema';
import { hackspaces, roles, type Role } from '../../types';
import { createUser, createUserWithSession } from '../../testHelpers';
import { challenges, userHackspace } from '../schema';
import { adminMeta } from '../../admin/schema';
import { qrs } from '../../qr/schema';

const baseRoute = testClient(app).hackspace;

const sessionIds: Partial<Record<Role, string>> = {};
const userIds: Partial<Record<Role, string>> = {};

beforeAll(async () => {
  await db.execute(sql`TRUNCATE ${users} CASCADE`);
  await db.execute(sql`TRUNCATE ${userSession} CASCADE`);
  await db.execute(sql`TRUNCATE ${userHackspace} CASCADE`);
  await db.execute(sql`TRUNCATE ${adminMeta} CASCADE`);

  let i = 0;
  for (const role of roles) {
    const { userId, sessionId } = await createUserWithSession(role, {
      name: `Silver the ${role} Cat`,
      email: `${role}@joinhoney.com`,
      password: '4billion'
    });

    sessionIds[role] = sessionId;
    userIds[role] = userId;

    await db.insert(qrs).values({
      userId,
      uuid: `0000${i}`
    });
    i++;
  }

  await db.insert(adminMeta).values({ mealNumber: -1, showCategories: false });
});

beforeEach(async () => {
  await db.execute(sql`TRUNCATE ${userHackspace} CASCADE`);
});

describe('Hackspace Module > POST /', async () => {
  test('Can choose a hackspace', async () => {
    const res = await baseRoute.$post(
      { json: { hackspace: 'jcr' } },
      { headers: { Cookie: `auth_session=${sessionIds['hacker']}` } }
    );

    expect(res.status).toBe(201);

    const dbRes = await db
      .delete(userHackspace)
      .where(eq(userHackspace.userId, userIds['hacker']!))
      .returning();

    expect(dbRes.length).toBe(1);
    expect(dbRes[0]!.hackspace).toBe('jcr');
  });

  test("Can't POST hackspace if already in one", async () => {
    await db.insert(userHackspace).values({
      userId: userIds['hacker']!,
      hackspace: 'jcr'
    });

    const res = await baseRoute.$post(
      { json: { hackspace: 'jcr' } },
      { headers: { Cookie: `auth_session=${sessionIds['hacker']}` } }
    );

    expect(res.status).toBe(409);

    await db
      .delete(userHackspace)
      .where(eq(userHackspace.userId, userIds['hacker']!));
  });
});

describe('Hackspace Module > PUT /', async () => {
  test('Can update hackspace', async () => {
    await db
      .insert(userHackspace)
      .values({ userId: userIds['hacker']!, hackspace: 'jcr' });

    const res = await baseRoute.$put(
      { json: { hackspace: 'qtr' } },
      { headers: { Cookie: `auth_session=${sessionIds['hacker']}` } }
    );

    expect(res.status).toBe(200);

    const dbRes = await db
      .delete(userHackspace)
      .where(eq(userHackspace.userId, userIds['hacker']!))
      .returning();

    expect(dbRes.length).toBe(1);
    expect(dbRes[0]!.hackspace).toBe('qtr');
  });

  test("Can't update hackspace after dinner", async () => {
    await db
      .insert(userHackspace)
      .values({ userId: userIds['hacker']!, hackspace: 'jcr' });

    await db.update(adminMeta).set({ mealNumber: 2 });

    const res = await baseRoute.$put(
      { json: { hackspace: 'qtr' } },
      { headers: { Cookie: `auth_session=${sessionIds['hacker']}` } }
    );

    expect(res.status).toBe(403);

    const dbRes = await db
      .delete(userHackspace)
      .where(eq(userHackspace.userId, userIds['hacker']!))
      .returning();

    expect(dbRes.length).toBe(1);
    expect(dbRes[0]!.hackspace).toBe('jcr');
  });
});

describe('Hackspace Module > POST /:id', async () => {
  test("Volunteer can set hacker's hackspace", async () => {
    const res = await baseRoute[':id'].$post(
      { json: { hackspace: 'qtr' }, param: { id: userIds['hacker']! } },
      { headers: { Cookie: `auth_session=${sessionIds['volunteer']}` } }
    );

    expect(res.status).toBe(201);

    const dbRes = await db
      .delete(userHackspace)
      .where(eq(userHackspace.userId, userIds['hacker']!))
      .returning();

    expect(dbRes.length).toBe(1);
    expect(dbRes[0]!.hackspace).toBe('qtr');
  });

  test("Volunteer can't overwrite hacker's hackspace", async () => {
    await db.insert(userHackspace).values({
      userId: userIds['hacker']!,
      hackspace: 'jcr'
    });

    const res = await baseRoute[':id'].$post(
      { json: { hackspace: 'qtr' }, param: { id: userIds['hacker']! } },
      { headers: { Cookie: `auth_session=${sessionIds['volunteer']}` } }
    );

    expect(res.status).toBe(409);
  });

  test("Volunteer can set hacker's hackspace after dinner", async () => {
    await db.update(adminMeta).set({ mealNumber: 2 });

    const res = await baseRoute[':id'].$post(
      { json: { hackspace: 'qtr' }, param: { id: userIds['hacker']! } },
      { headers: { Cookie: `auth_session=${sessionIds['volunteer']}` } }
    );

    expect(res.status).toBe(201);

    const dbRes = await db
      .delete(userHackspace)
      .where(eq(userHackspace.userId, userIds['hacker']!))
      .returning();

    expect(dbRes.length).toBe(1);
    expect(dbRes[0]!.hackspace).toBe('qtr');
  });
});

describe('Hackspace Module > GET /scores', async () => {
  test('Sum is calculated correctly', async () => {
    const totals = {
      jcr: 0,
      qtr: 0,
      scr: 0
    };

    for (const hackspace of hackspaces) {
      for (let i = 0; i < 10; i++) {
        const userId = await createUser('hacker', {
          name: `Silver the ${hackspace}${i} Cat`,
          email: `${hackspace}${i}@cat.meow`,
          password: 'SomePass4!'
        });

        await db.insert(userHackspace).values({
          userId: userId,
          hackspace,
          points: i
        });

        totals[hackspace] += i;
      }
    }

    await db.insert(challenges).values({
      name: `Test challenge`,
      qtr: 3,
      scr: 3,
      jcr: 3
    });
    totals.qtr += 3;
    totals.scr += 3;
    totals.jcr += 3;

    const res = await baseRoute['scores'].$get(undefined, {
      headers: { Cookie: `auth_session=${sessionIds['hacker']}` }
    });

    expect(res.status).toBe(200);
    const resJson = await res.json();
    expect(resJson).toEqual(totals);
  });
});

describe('Hackspace Module > PUT /users/:id', async () => {
  test('only an admin can update a user', async () => {
    await db.insert(userHackspace).values({
      userId: userIds['hacker']!,
      hackspace: 'jcr',
      points: 0
    });

    const req = await baseRoute.users[':id'].$put(
      {
        json: { hackspace: 'qtr', points: 10 },
        param: { id: userIds['hacker']! }
      },
      { headers: { Cookie: `auth_session=${sessionIds['hacker']}` } }
    );

    // @ts-expect-error middleware go brr
    expect(req.status).toBe(403);
  });

  test('can update a user', async () => {
    await db.insert(userHackspace).values({
      userId: userIds['hacker']!,
      hackspace: 'jcr',
      points: 0
    });

    const req = await baseRoute.users[':id'].$put(
      {
        json: { hackspace: 'qtr', points: 10 },
        param: { id: userIds['hacker']! }
      },
      { headers: { Cookie: `auth_session=${sessionIds['admin']}` } }
    );

    expect(req.status).toBe(201);

    const res = await db
      .select()
      .from(userHackspace)
      .where(eq(userHackspace.userId, userIds['hacker']!));

    expect(res.length).toBe(1);
    expect(res[0]!.hackspace).toBe('qtr');
    expect(res[0]!.points).toBe(10);
  });
});
