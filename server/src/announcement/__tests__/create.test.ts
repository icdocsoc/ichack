import { describe, test, expect, beforeAll, jest } from 'bun:test';
import { db } from '../../drizzle';
import { users } from '../../auth/schema';
import { announcements } from '../schema';
import { createUserWithSession, today, tomorrow } from '../../testHelpers';
import { testClient } from 'hono/testing';
import app from '../../app';
import { eq, sql } from 'drizzle-orm';
import { lucia } from '../../auth/lucia';

let adminSession: string;
let adminId: string;

const client = testClient(app);

beforeAll(async () => {
  await db.execute(sql`TRUNCATE ${users} CASCADE`);
  await db.execute(sql`TRUNCATE ${announcements} CASCADE`);

  const { sessionId, userId } = await createUserWithSession('admin', {
    name: 'Nishant',
    email: `admin@ic.ac.uk`,
    password: 'dontheckme'
  });
  adminId = userId;
  adminSession = sessionId;
});

describe('Announcement Module > POST /', () => {
  test('Successfully creates an announcement', async () => {
    // Mock the date
    jest.setSystemTime(today);

    const newAnnouncement = {
      title: 'Test Announcement',
      description: 'This is a test announcement',
      pinUntil: tomorrow
    };
    const res = await client.announcement.$post(
      {
        json: newAnnouncement
      },
      {
        headers: {
          Cookie: `auth_session=${adminSession}`
        }
      }
    );

    expect(res.status).toBe(201);

    const { id } = await res.json();

    // Verify the announcement was created in the database
    const announcement = await db
      .select()
      .from(announcements)
      .where(eq(announcements.id, id));

    expect(announcement.length).toBe(1);
    expect(announcement[0]).toEqual({
      ...newAnnouncement,
      id: expect.any(Number),
      createdAt: expect.any(Date)
    });

    // Verify the createdAt is within 10 seconds of the current time
    expect(announcement[0]!.createdAt).toEqual(today);

    jest.clearAllMocks();
  });
  test('Unauthorised user cannot create an announcement', async () => {
    const { sessionId: volunteerId } = await createUserWithSession(
      'volunteer',
      {
        name: 'Volunteer',
        email: 'volunteer@ic.ac.uk',
        password: 'dontheckme'
      }
    );

    const res = await client.announcement.$post(
      {
        json: {
          title: 'Test Announcement',
          description: 'This is a test announcement'
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
      'You do not have access to POST /api/announcement'
    );
  });
  test('Invalid session of user cannot create an announcement', async () => {
    await lucia.invalidateSession(adminSession);

    const res = await client.announcement.$post(
      {
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
      'You do not have access to POST /api/announcement'
    );

    // Restoring the session
    await lucia.createSession(adminId, {}, { sessionId: adminSession });
  });
  test('Cannot create with an id or createdAt', async () => {
    const res = await client.announcement.$post(
      {
        json: {
          // @ts-ignore for this test
          id: 1,
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

    // @ts-ignore this can return 400
    expect(res.status).toBe(400);
    expect(res.text()).resolves.toBe("Property 'id' is not allowed");

    const res2 = await client.announcement.$post(
      {
        json: {
          title: 'Test Announcement',
          description: 'This is a test announcement',
          // @ts-expect-error for this test
          createdAt: tomorrow
        }
      },
      {
        headers: {
          Cookie: `auth_session=${adminSession}`
        }
      }
    );

    // @ts-ignore this can return 400
    expect(res2.status).toBe(400);
    expect(res2.text()).resolves.toBe("Property 'createdAt' is not allowed");
  });
});
