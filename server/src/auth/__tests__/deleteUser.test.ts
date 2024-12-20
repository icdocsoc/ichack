import { describe, expect, test, beforeAll } from 'bun:test';
import { db } from '../../drizzle';
import { users } from '../schema';
import { roles, type Role } from '../../types';
import { createUserWithSession } from '../../testHelpers';
import { testClient } from 'hono/testing';
import app from '../../app';
import { eq, sql } from 'drizzle-orm';

const sessionIds: Partial<Record<Role, string>> = {};
const userIds: Partial<Record<Role, string>> = {};

const client = testClient(app);

beforeAll(async () => {
  await db.execute(sql`TRUNCATE ${users} CASCADE`);

  for (const role of roles) {
    const { sessionId, userId } = await createUserWithSession(role, {
      name: 'Nishant',
      email: `${role}@ic.ac.uk`,
      password: 'dontheckme'
    });
    sessionIds[role] = sessionId;
    userIds[role] = userId;
  }
});

describe('Auth Module > DELETE /:id', () => {
  test('A god can delete users', async () => {
    const res = await client.auth[':id'].$delete(
      {
        param: {
          id: userIds.hacker!
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.god}`
        }
      }
    );

    expect(res.status).toBe(200);

    // Verify the user was deleted from the database
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userIds.hacker!));

    expect(user.length).toBe(0);
  });

  test("Deleting a user that doesn't exist", async () => {
    const res = await client.auth[':id'].$delete(
      {
        param: {
          id: 'nonexistent'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.god}`
        }
      }
    );

    expect(res.status).toBe(404);
    expect(res.text()).resolves.toBe(
      "User with id 'nonexistent' does not exist"
    );
  });

  test('Nobody else can delete a user', async () => {
    for (const role of roles) {
      if (role === 'god') continue;

      // Sign in as the role and try to create a user
      const res = await client.auth[':id'].$delete(
        {
          param: {
            id: userIds.hacker!
          }
        },
        {
          headers: {
            Cookie: `auth_session=${sessionIds[role]}`
          }
        }
      );

      // Verify the response is a 403
      expect(res.ok).toBeFalse();
      // @ts-ignore this can return 403.
      expect(res.status).toBe(403);
      expect(res.text()).resolves.toBe(
        `You do not have access to DELETE /api/auth/${userIds.hacker!}`
      );
    }
  });

  test('Gods cannot delete themselves', async () => {
    const res = await client.auth[':id'].$delete(
      {
        param: {
          id: userIds.god!
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.god}`
        }
      }
    );

    expect(res.status).toBe(400);
    expect(res.text()).resolves.toBe("You can't delete yourself");
  });
});
