import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { db } from '../../drizzle';
import { users, userSession, userToken } from '../schema';
import { eq, sql } from 'drizzle-orm';
import {
  createUser,
  createUserWithSession,
  tomorrow,
  yesterday
} from '../../testHelpers';
import { hashOptions } from '../lucia';
import { verify } from 'argon2';
import { testClient } from 'hono/testing';
import app from '../../app';

const TOKEN_ID = 'tokenId1234';
let userId: string;

const client = testClient(app).auth;

beforeAll(async () => {
  await db.execute(sql`TRUNCATE ${users} CASCADE`);
  await db.execute(sql`TRUNCATE ${userSession} CASCADE`);
  await db.execute(sql`TRUNCATE ${userToken} CASCADE`);

  userId = await createUser('hacker', {
    name: 'Nishant',
    email: 'nj421@ic.ac.uk',
    password: 'Nishant123456'
  });
});

describe('Auth Module > POST /resetPassword', () => {
  beforeEach(async () => {
    // Delete all the tokens
    await db.delete(userToken);

    // Insert a token valid token
    await db.insert(userToken).values({
      id: TOKEN_ID,
      userId,
      expiresAt: tomorrow,
      type: 'forgot_password'
    });
  });

  test('should reset password with valid token', async () => {
    // invoke the route to reset the password
    const newPassword = 'NewPassword1234';
    const res = await client.resetPassword.$post({
      json: {
        token: TOKEN_ID,
        password: newPassword
      }
    });

    // Assert success
    expect(res.status).toBe(200);
    const updatedUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    expect(updatedUser).toHaveLength(1);

    // Verify if passsword is updated
    const updatedPassword = updatedUser[0].password;
    expect(updatedPassword).not.toBeNull();
    expect(await verify(updatedPassword!, newPassword, hashOptions)).toBeTrue();

    // Verify if the token is deleted
    const tokens = await db
      .select()
      .from(userToken)
      .where(eq(userToken.id, TOKEN_ID));
    expect(tokens).toHaveLength(0);
  });

  test('User with a session cannot reset password', async () => {
    // Create a user with a session
    const { userId: hackerId, sessionId } = await createUserWithSession(
      'hacker',
      {
        name: 'Nishant',
        email: 'nj421+1234@ic.ac.uk',
        password: 'Nishant123456'
      }
    );

    // Invoke the route to reset the password
    const res = await client.resetPassword.$post(
      {
        json: {
          token: TOKEN_ID,
          password: 'SomePassword1234'
        }
      },
      {
        headers: { Cookie: `auth_session=${sessionId}` }
      }
    );

    // Assert failure
    expect(res.status).toBe(409);

    // Teardown
    await db.delete(userSession).where(eq(userSession.id, sessionId));
    await db.delete(users).where(eq(users.id, hackerId));
  });

  test('should reject invalid token', async () => {
    const res = await client.resetPassword.$post({
      json: {
        token: 'invalidToken',
        password: 'SomePassword1234'
      }
    });

    expect(res.status).toBe(401);
    expect(await res.text()).toBe('An invalid token was provided');
  });
  test('should reject expired token', async () => {
    const expiredToken = {
      id: 'expiredToken',
      userId,
      expiresAt: yesterday,
      type: 'forgot_password'
    } as const;
    await db.insert(userToken).values(expiredToken);

    const res = await client.resetPassword.$post({
      json: {
        token: 'expiredToken',
        password: 'SomePassword1234'
      }
    });

    expect(res.status).toBe(401);
    expect(await res.text()).toBe('An invalid token was provided');

    const tokens = await db.select().from(userToken);
    expect(tokens).not.toContainEqual(expiredToken);
  });
  test('should reject weak password', async () => {
    const res = await client.resetPassword.$post({
      json: {
        token: TOKEN_ID,
        password: 'weak'
      }
    });

    // @ts-ignore this can return 400
    expect(res.status).toBe(400);
    // expect(await res.text()).toBe('Password is too weak'); TODO with error handling
  });
  test('should reject wrong token type', async () => {
    await db.insert(userToken).values({
      id: 'anotherToken',
      userId,
      expiresAt: yesterday,
      type: 'registration_link'
    });

    const res = await client.resetPassword.$post({
      json: {
        token: 'anotherToken',
        password: 'SomePassword1234'
      }
    });

    expect(res.status).toBe(401);
    expect(await res.text()).toBe('An invalid token was provided');
  });
  test('should reject token reuse', async () => {
    // Reset the password once
    const res = await client.resetPassword.$post({
      json: {
        token: TOKEN_ID,
        password: 'SomePassword1234'
      }
    });

    expect(res.status).toBe(200);

    // Reset the password again with same token
    const res2 = await client.resetPassword.$post({
      json: {
        token: TOKEN_ID,
        password: 'SomePassword1234'
      }
    });

    expect(res2.status).toBe(401);
    expect(await res2.text()).toBe('An invalid token was provided');
  });
  test('should reject token/password not sent', async () => {
    const res = await client.resetPassword.$post({
      // @ts-ignore password is missing for testing purposes
      json: {
        token: TOKEN_ID
      }
    });

    // @ts-ignore this can return 400
    expect(res.status).toBe(400);
    // expect(await res.text()).toBe('Password is required'); TODO with error handling

    const res2 = await client.resetPassword.$post({
      // @ts-ignore token is missing for testing purposes
      json: {
        password: 'SomePassword1234'
      }
    });

    // @ts-ignore this can return 400
    expect(res2.status).toBe(400);
    // expect(await res2.text()).toBe('Token is required'); TODO with error handling
  });
});
