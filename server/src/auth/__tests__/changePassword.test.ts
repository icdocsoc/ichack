import { beforeAll, describe, expect, test } from 'bun:test';
import { db } from '../../drizzle';
import { eq, sql } from 'drizzle-orm';
import { users, userSession } from '../schema';
import { createUserWithSession } from '../../testHelpers';
import { testClient } from 'hono/testing';
import app from '../../app';
import { hash, verify } from 'argon2';
import { hashOptions } from '../lucia';

let adminSession: string;
let adminId: string;

let hackerSession: string;
let hackerId: string;

const client = testClient(app);

const existingPassword = 'Dontheckme123';
const changedPassword = 'NewPassword1234';

beforeAll(async () => {
  await db.execute(sql`TRUNCATE ${users} CASCADE`);

  {
    const { userId, sessionId } = await createUserWithSession('admin', {
      name: 'Nishant',
      email: `admin@ic.ac.uk`,
      password: await hash(existingPassword, hashOptions)
    });

    adminSession = sessionId;
    adminId = userId;
  }

  const { userId, sessionId } = await createUserWithSession('hacker', {
    name: 'Nishant',
    email: `hacker@ic.ac.uk`,
    password: null
  });

  hackerSession = sessionId;
  hackerId = userId;
});

describe('Auth Module > PUT /changePassword', () => {
  test('can change their password', async () => {
    // needed for teardown
    const validSessions = await db
      .select()
      .from(userSession)
      .where(eq(userSession.userId, adminId));

    const res = await client.auth.changePassword.$put(
      {
        json: {
          oldPassword: existingPassword,
          newPassword: changedPassword
        }
      },
      {
        headers: {
          Cookie: `auth_session=${adminSession}`
        }
      }
    );

    expect(res.status).toBe(200);

    // Verify the password was updated in the database
    const user = (
      await db.select().from(users).where(eq(users.id, adminId))
    )[0];
    expect(
      await verify(user.password!, changedPassword, hashOptions)
    ).toBeTrue();

    // Verify the user sessions were deleted
    const userSessions = await db
      .select()
      .from(userSession)
      .where(eq(userSession.userId, adminId));
    expect(userSessions).toHaveLength(0);

    // teardown
    await db.insert(userSession).values(validSessions);
  });
  test('incorrect current password returns 401', async () => {
    const res = await client.auth.changePassword.$put(
      {
        json: {
          oldPassword: 'WrongPassword123',
          newPassword: 'NewPassword1234'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${adminSession}`
        }
      }
    );

    expect(res.status).toBe(401);
    expect(res.text()).resolves.toBe("The current password doesn't match");
  });

  test('weak new password returns 400', async () => {
    const res = await client.auth.changePassword.$put(
      {
        json: {
          oldPassword: existingPassword,
          newPassword: 'weak'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${adminSession}`
        }
      }
    );

    expect(res.status).toBe(400);
    expect(res.text()).resolves.toBe(
      "Property 'newPassword' does not satisfy the conditions"
    );
  });
  test('same as old password returns 400', async () => {
    const res = await client.auth.changePassword.$put(
      {
        json: {
          oldPassword: existingPassword,
          newPassword: existingPassword
        }
      },
      {
        headers: {
          Cookie: `auth_session=${adminSession}`
        }
      }
    );

    expect(res.status).toBe(400);
    expect(res.text()).resolves.toBe(
      "The new password can't be the same as the old password"
    );
  });
});
