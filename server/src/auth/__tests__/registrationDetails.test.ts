import { beforeAll, describe, test, expect } from 'bun:test';
import { db } from '../../drizzle';
import { eq, sql } from 'drizzle-orm';
import { users, userToken } from '../schema';
import { createUser, tomorrow, yesterday } from '../../testHelpers';
import { testClient } from 'hono/testing';
import app from '../../app';

const client = testClient(app);

describe('Auth Module > GET /registerDetails', () => {
  beforeAll(async () => {
    await db.execute(sql`TRUNCATE ${users} CASCADE`);
    await db.execute(sql`TRUNCATE ${userToken} CASCADE`);

    const hackerId = await createUser('hacker', {
      name: 'Nishant',
      email: 'nj421@ic.ac.uk',
      password: null
    });

    await db.insert(userToken).values([
      {
        id: 'hacker_token_1',
        userId: hackerId,
        expiresAt: tomorrow,
        type: 'registration_link'
      },
      {
        id: 'hacker_token_2',
        userId: hackerId,
        expiresAt: yesterday,
        type: 'registration_link'
      },
      {
        id: 'hacker_token_3',
        userId: hackerId,
        expiresAt: tomorrow,
        type: 'forgot_password'
      }
    ]);
  });

  test('should return user details for a valid token', async () => {
    const res = await client.auth.register.$get({
      query: { token: 'hacker_token_1' }
    });

    expect(res.ok).toBeTrue();
    expect(res.status).toBe(200);

    expect(res.json()).resolves.toEqual({
      name: 'Nishant',
      email: 'nj421@ic.ac.uk',
      role: 'hacker'
    });

    const currentTokens = await db
      .select()
      .from(userToken)
      .where(eq(userToken.id, 'hacker_token_1'));

    expect(currentTokens).toHaveLength(1);
  });

  test('should return 404 for an unknown token', async () => {
    const res = await client.auth.register.$get({
      query: { token: 'hacker_token_4' }
    });

    expect(res.ok).toBeFalse();
    expect(res.status).toBe(404);

    expect(res.text()).resolves.toBe('Token not found');
  });

  test('should return 404 for an expired token', async () => {
    const res = await client.auth.register.$get({
      query: { token: 'hacker_token_2' }
    });

    expect(res.ok).toBeFalse();
    expect(res.status).toBe(404);

    expect(res.text()).resolves.toBe('Token not found');
  });

  test('should return 404 for a non-registration token', async () => {
    const res = await client.auth.register.$get({
      query: { token: 'hacker_token_3' }
    });

    expect(res.ok).toBeFalse();
    expect(res.status).toBe(404);

    expect(res.text()).resolves.toBe('Token not found');
  });

  test('should return 400 for a missing token', async () => {
    // @ts-expect-error - token is missing for testing
    const res = await client.auth.register.$get({});

    expect(res.ok).toBeFalse();
    // @ts-ignore - status 400 is possible.
    expect(res.status).toBe(400);

    expect(res.text()).resolves.toBe(
      "'token' is either missing or not a string"
    );
  });
});
