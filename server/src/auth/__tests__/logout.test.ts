import { describe, test, expect, beforeEach } from 'bun:test';
import { createUserWithSession } from '../../testHelpers';
import { testClient } from 'hono/testing';
import app from '../../app';
import { db } from '../../drizzle';
import { users } from '../schema';
import { sql } from 'drizzle-orm';

beforeEach(async () => {
  await db.execute(sql`TRUNCATE ${users} CASCADE`);
});

const client = testClient(app);

describe('Auth Module > POST /logout', () => {
  test('a user can logout', async () => {
    // Create a session
    const { sessionId } = await createUserWithSession('hacker', {
      name: 'Nishant',
      email: 'nj421@ic.ac.uk',
      password: 'dontheckme'
    });

    // test can logout
    const res = await client.auth.logout.$post(undefined, {
      headers: {
        Cookie: `auth_session=${sessionId}`
      }
    });
    expect(res.status).toBe(204);

    const cookies = res.headers.getSetCookie();
    expect(cookies).toHaveLength(1);

    const authToken = cookies[0].split(';')[0].split('=')[1];
    expect(authToken).toBeEmpty();
  });

  test('unauthenticated user cannot logout', async () => {
    const res = await client.auth.logout.$post();

    // @ts-ignore this can return 403
    expect(res.status).toBe(403);
    expect(res.text()).resolves.toBe(
      'You do not have access to POST /api/auth/logout'
    );
  });

  test('user session is invalidated after logout', async () => {
    const { sessionId } = await createUserWithSession('hacker', {
      name: 'Nishant',
      email: 'nj421@ic.ac.uk',
      password: 'dontheckme'
    });

    // logout once
    await client.auth.logout.$post(undefined, {
      headers: {
        Cookie: `auth_session=${sessionId}`
      }
    });

    // logout again
    // Logout is a protected route (for authenticated users only)
    const res = await client.auth.logout.$post(undefined, {
      headers: {
        Cookie: `auth_session=${sessionId}`
      }
    });

    // @ts-ignore this can return 403
    expect(res.status).toBe(403);
    expect(res.text()).resolves.toBe(
      'You do not have access to POST /api/auth/logout'
    );
  });
});
