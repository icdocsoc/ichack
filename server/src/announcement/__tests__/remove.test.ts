import { describe, test, expect, beforeAll } from 'bun:test';
import { db } from '../../drizzle';
import { users } from '../../auth/schema';
import { announcements } from '../schema';
import { createUserWithSession } from '../../testHelpers';
import { testClient } from 'hono/testing';
import app from '../../app';
import { eq, sql } from 'drizzle-orm';
import { lucia } from '../../auth/lucia';

let adminId: string;
let adminSession: string;

const client = testClient(app);

beforeAll(async () => {
  await db.execute(sql`TRUNCATE ${users} CASCADE`);
  await db.execute(sql`TRUNCATE ${announcements} CASCADE`);

  const { sessionId, userId } = await createUserWithSession('admin', {
    name: 'Nishant',
    email: `hacker@ic.ac.uk`,
    password: 'dontheckme'
  });
  adminId = userId;
  adminSession = sessionId;

  await db.insert(announcements).values({
    id: 1,
    title: "Terra's challenge has been changed",
    description: 'From healthcare to Military AI',
    createdAt: new Date()
  });
});

describe('Announcement Module > DELETE /:id', () => {
  test('Successfully deletes an announcement', async () => {
    const res = await client.announcement[':id'].$delete(
      {
        param: {
          id: '1'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${adminSession}`
        }
      }
    );

    expect(res.status).toBe(200);

    // Verify the announcement was created in the database
    const announcement = await db
      .select()
      .from(announcements)
      .where(eq(announcements.id, 1));

    expect(announcement.length).toBe(0);
  });
  test('Unauthorised user cannot delete an announcement', async () => {
    const { sessionId: volunteerId } = await createUserWithSession(
      'volunteer',
      {
        name: 'Volunteer',
        email: 'volunteer@ic.ac.uk',
        password: 'dontheckme'
      }
    );

    const res = await client.announcement[':id'].$delete(
      {
        param: {
          id: '1'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${volunteerId}`
        }
      }
    );

    // @ts-ignore this can return 403
    expect(res.status).toBe(403);
    expect(res.text()).resolves.toBe(
      'You do not have access to DELETE /api/announcement/1'
    );
  });
  test('Invalid session of user cannot create an announcement', async () => {
    await lucia.invalidateSession(adminSession);

    const res = await client.announcement[':id'].$delete(
      {
        param: {
          id: '1'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${adminSession}`
        }
      }
    );

    // @ts-ignore this can return 403
    expect(res.status).toBe(403);
    expect(res.text()).resolves.toBe(
      'You do not have access to DELETE /api/announcement/1'
    );

    // Restoring the session
    await lucia.createSession(adminId, {}, { sessionId: adminSession });
  });

  test('Cannot delete a non-existant announcement', async () => {
    const res = await client.announcement[':id'].$delete(
      {
        param: {
          id: '100'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${adminSession}`
        }
      }
    );

    expect(res.status).toBe(404);
    expect(res.text()).resolves.toBe("Announcement of id '100' not found");
  });
});
