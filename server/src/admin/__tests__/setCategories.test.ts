import { beforeEach, describe, expect, test } from 'bun:test';
import { createUserWithSession } from '../../testHelpers';
import { db } from '../../drizzle';
import { sql } from 'drizzle-orm';
import { adminMeta } from '../schema';
import { users } from '../../auth/schema';
import { testClient } from 'hono/testing';
import app from '../../app';

let adminSessionId: string;
let hackerSessionId: string;

const client = testClient(app);

beforeEach(async () => {
  await db.execute(sql`TRUNCATE ${adminMeta}`);
  await db.execute(sql`TRUNCATE ${users} CASCADE`);

  const { sessionId: aSessionId } = await createUserWithSession('admin', {
    name: 'Nishant',
    email: 'nj421@ic.ac.uk',
    password: 'Pass#1234'
  });
  adminSessionId = aSessionId;

  const { sessionId: hSessionId } = await createUserWithSession('hacker', {
    name: 'Jay',
    email: 'aa7123@ic.ac.uk',
    password: 'Pass#1234'
  });
  hackerSessionId = hSessionId;

  await db.insert(adminMeta).values({ showCategories: false, mealNumber: -1 });
});

describe('Admin Module > PUT /setCategories', () => {
  test('an admin can set the showCategories flag', async () => {
    const res = await client.admin.setCategories.$put(undefined, {
      headers: {
        Cookie: `auth_session=${adminSessionId}`
      }
    });

    expect(res.status).toBe(204);

    const adminData = await db.select().from(adminMeta);
    expect(adminData[0]!.showCategories).toBe(true);
  });

  test('a non-admin cannot set the showCategories flag', async () => {
    const res = await client.admin.setCategories.$put(undefined, {
      headers: {
        Cookie: `auth_session=${hackerSessionId}`
      }
    });

    // @ts-expect-error middleware go brr
    expect(res.status).toBe(403);
  });
});
