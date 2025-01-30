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

describe('Admin Module > PUT /mealNumber', () => {
  test('an admin can change the mealNumber', async () => {
    let res = await client.admin.mealNumber.$put(
      {
        json: {
          mealNumber: 1
        }
      },
      {
        headers: {
          Cookie: `auth_session=${adminSessionId}`
        }
      }
    );

    expect(res.status).toBe(204);

    let adminData = await db.select().from(adminMeta);
    expect(adminData[0]!.mealNumber).toBe(1);

    res = await client.admin.mealNumber.$put(
      {
        json: {
          mealNumber: -1
        }
      },
      {
        headers: {
          Cookie: `auth_session=${adminSessionId}`
        }
      }
    );

    expect(res.status).toBe(204);

    adminData = await db.select().from(adminMeta);
    expect(adminData[0]!.mealNumber).toBe(-1);
  });

  test('a non-admin cannot change the mealNumber', async () => {
    const res = await client.admin.mealNumber.$put(
      {
        json: {
          mealNumber: 1
        }
      },
      {
        headers: {
          Cookie: `auth_session=${hackerSessionId}`
        }
      }
    );

    // @ts-expect-error middleware go brr
    expect(res.status).toBe(403);
  });
});
