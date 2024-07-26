import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { createUserWithSession } from '../../testHelpers';
import { eq } from 'drizzle-orm';
import { testClient } from 'hono/testing';
import app from '../..';
import { db } from '../../drizzle';
import { roles } from '../../types';
import { users, userSession } from '../schema';

const sessionIds: { [K in (typeof roles)[number]]?: string } = {};

beforeAll(async () => {
  await db.delete(userSession); // User session should be deleted first
  await db.delete(users); // Delete users second

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
    // TEST
    const res = await testClient(app).auth.create.$post(
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

    const userFromResponse = await res.json();

    expect(res.status).toBe(201);

    // Verify the user was created in the database
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, 'test@example.org'));
    expect(user.length).toBe(1);
    expect(user[0].id).toBeTruthy();
    expect(user[0].name).toBe('test');
    expect(user[0].role).toBe('hacker');

    // Verify the response body matches the database
    expect(userFromResponse.id).toBe(user[0].id);
  });

  test('no other auth role can create a user', async () => {
    // TEST
    for (const role of roles) {
      if (role === 'god') continue;

      // Sign in as the role and try to create a user
      const res = await testClient(app).auth.create.$post(
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
    }
  });

  test('public user cannot access this route', async () => {
    // TEST
    const res = await testClient(app).auth.create.$post({
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
  });

  test('Cannot create a user with an existing email', async () => {
    // TEST SETUP

    // Create a user with the same email
    const res = await testClient(app).auth.create.$post(
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
    expect(errorMsg).toBe('Failed to create user');
  });

  test('request body with no email is rejected', async () => {
    const res = await testClient(app).auth.create.$post(
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
  });

  test('request body with bad email is rejected', async () => {
    const res = await testClient(app).auth.create.$post(
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
  });
});
