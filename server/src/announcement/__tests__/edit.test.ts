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

describe('Announcement Module > PUT /:id', () => {
  test('Successfully edits an announcement', async () => {
    const res = await client.announcement[':id'].$put(
      {
        param: {
          id: '1'
        },
        json: {
          title: "Terra's challenge has been changed again!",
          description: 'From healthcare to Military AI but also Space'
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

    expect(announcement.length).toBe(1);
    expect(announcement[0].description).toBe(
      'From healthcare to Military AI but also Space'
    );
    expect(announcement[0].title).toBe(
      "Terra's challenge has been changed again!"
    );
  });
  test('Unauthorised user cannot edit an announcement', async () => {
    const { sessionId: volunteerId } = await createUserWithSession(
      'volunteer',
      {
        name: 'Volunteer',
        email: 'volunteer@ic.ac.uk',
        password: 'dontheckme'
      }
    );

    const res = await client.announcement[':id'].$put(
      {
        param: {
          id: '1'
        },
        json: {
          title: 'Nuclear war is coming',
          description: 'I have hecked ICHack'
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
      'You do not have access to PUT /api/announcement/1'
    );

    // To that volunteer, no you can't. :)
  });
  test('Invalid session of user cannot create an announcement', async () => {
    await lucia.invalidateSession(adminSession);

    const res = await client.announcement[':id'].$put(
      {
        param: {
          id: '1'
        },
        json: {
          title: 'Test Announcement',
          description: 'This is a test announcement'
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
      'You do not have access to PUT /api/announcement/1'
    );

    // Restoring the session
    await lucia.createSession(adminId, {}, { sessionId: adminSession });
  });
  test('Cannot change the id or the createdAt', async () => {
    const res = await client.announcement[':id'].$put(
      {
        param: {
          id: '1'
        },
        json: {
          // @ts-ignore for this test
          id: '2',
          createdAt: new Date()
        }
      },
      {
        headers: {
          Cookie: `auth_session=${adminSession}`
        }
      }
    );

    // @ts-ignore this can return 400
    expect(res.status).toBe(400);
    expect(res.text()).resolves.toBe(
      "Properties 'id', 'createdAt' are not allowed"
    );
  });

  test('Cannot edit a non-existant announcement', async () => {
    const res = await client.announcement[':id'].$put(
      {
        param: {
          id: '100'
        },
        json: {
          title: 'Wtf? Announcement'
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
