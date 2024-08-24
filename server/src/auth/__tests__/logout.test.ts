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

const client = testClient(app).api;

describe('Auth Module > POST /logout', () => {
  test('a user can logout', async () => {
    // TEST SETUP
    const { sessionId } = await createUserWithSession('hacker', {
      name: 'Nishant',
      email: 'nj421@ic.ac.uk',
      password: 'dontheckme'
    });

    // TEST
    const res = await client.auth.logout.$post(
      {},
      {
        headers: {
          Cookie: `auth_session=${sessionId}`
        }
      }
    );

    expect(res.status).toBe(204);
  });

  test('unauthenticated user cannot logout', async () => {
    // TEST
    const res = await client.auth.logout.$post();

    // @ts-ignore this can return 403
    expect(res.status).toBe(403);
  });

  test('user session is invalidated after logout', async () => {
    // TEST SETUP
    const { sessionId } = await createUserWithSession('hacker', {
      name: 'Nishant',
      email: 'nj421@ic.ac.uk',
      password: 'dontheckme'
    });

    // TEST
    await client.auth.logout.$post(
      {},
      {
        headers: {
          Cookie: `auth_session=${sessionId}`
        }
      }
    );

    // Logout is a protected route (for authenticated users only)
    const res = await client.auth.logout.$post(
      {},
      {
        headers: {
          Cookie: `auth_session=${sessionId}`
        }
      }
    );

    // @ts-ignore this can return 403
    expect(res.status).toBe(403);
  });
});
