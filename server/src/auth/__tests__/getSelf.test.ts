import { beforeAll, describe, expect, test } from 'bun:test';
import { testClient } from 'hono/testing';
import app from '../../app';
import { db } from '../../drizzle';
import { sql } from 'drizzle-orm';
import { users } from '../schema';
import { createUserWithSession } from '../../testHelpers';

const client = testClient(app).api;
let hackerSessionId: string;
let hackerUserId: string;

beforeAll(async () => {
  await db.execute(sql`TRUNCATE ${users} CASCADE`);

  const { userId, sessionId } = await createUserWithSession('hacker', {
    name: 'Nishant',
    email: 'nj421@ic.ac.uk',
    password: 'Password1'
  });
  hackerUserId = userId;
  hackerSessionId = sessionId;
});

describe('Auth Module > GET /', () => {
  test('should return 200 with user data', async () => {
    const res = await client.auth.$get(undefined, {
      headers: {
        Cookie: `auth_session=${hackerSessionId}`
      }
    });

    expect(res.status).toBe(200);
    expect(res.json()).resolves.toEqual({
      id: hackerUserId,
      name: 'Nishant',
      email: 'nj421@ic.ac.uk',
      role: 'hacker'
    });
  });

  test('should return 401 if session is not sent', async () => {
    const res = await client.auth.$get();

    expect(res.status).toBe(403);
    expect(res.text()).resolves.toBe('You do not have access to GET /api/auth');
  });

  test('should return 401 if session is invalid', async () => {
    const res = await client.auth.$get(undefined, {
      headers: {
        Cookie: `auth_session=invalid`
      }
    });

    expect(res.status).toBe(403);
    expect(res.text()).resolves.toBe('You do not have access to GET /api/auth');
  });
});
