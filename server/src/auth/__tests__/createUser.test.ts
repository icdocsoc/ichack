import { describe, test, expect, beforeAll } from 'bun:test';
import { createUserWithSession } from '../../testHelpers';
import { eq, sql } from 'drizzle-orm';
import { testClient } from 'hono/testing';
import app from '../../app';
import { db } from '../../drizzle';
import { roles, type Role } from '../../types';
import { users } from '../schema';

const sessionIds: Partial<Record<Role, string>> = {};

const client = testClient(app);

beforeAll(async () => {
  await db.execute(sql`TRUNCATE ${users} CASCADE`);

  for (const role of roles) {
    const { sessionId } = await createUserWithSession(role, {
      name: 'Nishant',
      email: `${role}@ic.ac.uk`,
      password: 'dontheckme'
    });
    sessionIds[role] = sessionId;
  }
});

describe('Auth Module > POST /create', () => {
  test('a god can create a user', async () => {
    const res = await client.auth.create.$post(
      {
        json: {
          name: 'test',
          email: 'test@example.org',
          role: 'hacker'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.god}`
        }
      }
    );

    expect(res.status).toBe(201);

    // Verify the user was created in the database
    const usersInDb = await db
      .select()
      .from(users)
      .where(eq(users.email, 'test@example.org'));
    expect(usersInDb).toHaveLength(1);
    expect(usersInDb[0].id).toBeTruthy();
    expect(usersInDb[0].name).toBe('test');
    expect(usersInDb[0].role).toBe('hacker');
  });

  test('no other auth role can create a user', async () => {
    for (const role of roles) {
      if (role === 'god') continue;

      // Sign in as the role and try to create a user
      const res = await client.auth.create.$post(
        {
          json: {
            name: 'test',
            email: 'test@example.org',
            role: 'admin'
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
        'You do not have access to POST /api/auth/create'
      );
    }
  });

  test('public user cannot access this route', async () => {
    const res = await client.auth.create.$post({
      json: {
        name: 'test',
        email: 'test@example.org',
        role: 'god'
      }
    }); // No cookie passed here.

    // Any non-logged in user i.e. no cookie; should not be able to access this route
    expect(res.ok).toBeFalse();
    // @ts-ignore this can return 403.
    expect(res.status).toBe(403);
    expect(res.text()).resolves.toBe(
      'You do not have access to POST /api/auth/create'
    );
  });

  test('Cannot create a user with an existing email', async () => {
    // Create a user with the same email
    const res = await client.auth.create.$post(
      {
        json: {
          // Same email as the god user
          name: 'Nishanth',
          email: 'god@ic.ac.uk',
          role: 'god'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.god}`
        }
      }
    );

    expect(res.ok).toBeFalse();
    // @ts-ignore this can return 409.
    expect(res.status).toBe(409);

    const errorMsg = await res.text();
    expect(errorMsg).toBe(
      'duplicate key value violates unique constraint "users_email_unique"'
    );
  });

  test('request body with no email is rejected', async () => {
    const res = await client.auth.create.$post(
      {
        // @ts-ignore email is missing for testing purposes
        json: {
          name: 'newUser',
          role: 'god'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.god}`
        }
      }
    );

    // Verify the response is a 400
    expect(res.ok).toBeFalse();
    // @ts-ignore this can return 400.
    expect(res.status).toBe(400);
    expect(res.text()).resolves.toBe(
      "'email' is either missing or not a string"
    );
  });

  test('request body with bad email is rejected', async () => {
    const res = await client.auth.create.$post(
      {
        json: {
          name: 'newUser',
          email: 'bademail',
          role: 'god'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.god}`
        }
      }
    );

    expect(res.ok).toBeFalse();
    // @ts-ignore this can return 400.
    expect(res.status).toBe(400);
    expect(res.text()).resolves.toBe('Invalid email');
  });
});
