import { describe, test, beforeAll, expect, beforeEach } from 'bun:test';
import { db } from '../../drizzle';
import { adminMeta } from '../schema';
import { testClient } from 'hono/testing';
import app from '../../app';
import { sql } from 'drizzle-orm';
import { users } from '../../auth/schema';
import { createUserWithSession } from '../../testHelpers';
import { roles, type Role } from '../../types';
import { qrs } from '../../qr/schema';

const client = testClient(app);

const sessionIds: Partial<Record<Role, string>> = {};

beforeAll(async () => {
  await db.execute(sql`TRUNCATE ${users} CASCADE`);

  let i = 1;
  for (const role of roles) {
    const { userId, sessionId } = await createUserWithSession(role, {
      name: 'Nishant',
      email: `${role}@ic.ac.uk`,
      password: 'dontheckme'
    });
    sessionIds[role] = sessionId;

    await db.insert(qrs).values({ userId: userId, uuid: `000${i}` });
    i += 1;
  }
});

beforeEach(async () => {
  await db.execute(sql`TRUNCATE ${adminMeta}`);

  await db.insert(adminMeta).values({ showCategories: false, mealNumber: -1 });
});

describe('Admin Module', () => {
  test('Admin table should have exactly one row', async () => {
    await db.execute(sql`TRUNCATE ${adminMeta}`);

    // This should fail - no rows
    const res = await client.admin.$get(undefined, {
      headers: {
        Cookie: `auth_session=${sessionIds.admin}`
      }
    });
    // @ts-ignore middleware returns 500
    expect(res.status).toBe(500);

    await db.insert(adminMeta).values([
      { showCategories: false, mealNumber: 1 },
      { showCategories: true, mealNumber: 0 }
    ]);

    // this shuold fail - multiple rows
    const res2 = await client.admin.$get(undefined, {
      headers: {
        Cookie: `auth_session=${sessionIds.admin}`
      }
    });
    // @ts-ignore middleware returns 500
    expect(res2.status).toBe(500);
  });

  test('Nobody other than god/admin can access admin data', async () => {
    for (const role of roles) {
      if (role == 'admin' || role == 'god') continue;

      const res = await client.admin.setCategories.$put(undefined, {
        headers: {
          Cookie: `auth_session=${sessionIds[role]}`
        }
      });

      // @ts-expect-error As it's from the middleware.
      expect(res.status).toBe(403);
      expect(res.text()).resolves.toBe(
        'You do not have access to PUT /api/admin/setCategories'
      );
    }
  });
});

describe('Admin Module > GET /', () => {
  test('any authenticated user can get the meal number', async () => {
    const row = { mealNumber: 1, showCategories: true };
    await db.update(adminMeta).set(row);

    for (const role of roles) {
      const res = await client.admin.$get(undefined, {
        headers: {
          Cookie: `auth_session=${sessionIds[role]}`
        }
      });

      console.log(await res.text());
      expect(res.status).toBe(200);
      // expect(res.json()).resolves.toEqual(row);
    }
  });
});
