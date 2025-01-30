import { beforeAll, describe, expect, test } from 'bun:test';
import { db } from '../../drizzle';
import { eq, sql } from 'drizzle-orm';
import { users, userToken } from '../schema';
import { createUser } from '../../testHelpers';
import { testClient } from 'hono/testing';
import app from '../../app';

const client = testClient(app).auth;

beforeAll(async () => {
  await db.execute(sql`TRUNCATE ${users} CASCADE`);

  const userId = await createUser('hacker', {
    name: 'Nishant',
    email: 'nj421@ic.ac.uk',
    password: 'dontheckme'
  });
});

describe('Auth Module > POST /forgotPassword', () => {
  test('should create a forgot_password token', async () => {
    // invoke the route to send a reset password email
    const res = await client.forgotPassword.$post({
      json: {
        email: 'nj421@ic.ac.uk'
      }
    });

    // Assert success
    expect(res.status).toBe(200);

    // Assert that the token was created
    const tokens = await db
      .select()
      .from(users)
      .where(eq(users.email, 'nj421@ic.ac.uk'));
    expect(tokens).toHaveLength(1);

    // spy on email sending function
    // TODO
  });

  test('should not reveal if a user exists', async () => {
    const tokensPre = await db
      .select()
      .from(userToken)
      .where(eq(userToken.type, 'forgot_password'));

    // invoke the route to send a reset password email
    const res = await client.forgotPassword.$post({
      json: {
        email: 'jay@notregistered.com'
      }
    });

    // Assert success
    expect(res.status).toBe(200);

    // ensure no token was created
    const tokensPost = await db
      .select()
      .from(userToken)
      .where(eq(userToken.type, 'forgot_password'));

    expect(tokensPost).toEqual(tokensPre);
  });

  test("should not create a token for a user who hasn't registerd", async () => {
    const tokensPre = await db
      .select()
      .from(userToken)
      .where(eq(userToken.type, 'forgot_password'));

    // create a user who hasn't registered (no password)
    await createUser('hacker', {
      name: 'Jay',
      email: 'aa7123@ic.ac.uk',
      password: null
    });

    // Attempt to send a reset password email
    const res = await client.forgotPassword.$post({
      json: {
        email: 'aa7123@ic.ac.uk'
      }
    });

    // Assert success
    expect(res.status).toBe(200);

    // ensure no token was created
    const tokensPost = await db
      .select()
      .from(userToken)
      .where(eq(userToken.type, 'forgot_password'));

    expect(tokensPost).toEqual(tokensPre);
  });
});
