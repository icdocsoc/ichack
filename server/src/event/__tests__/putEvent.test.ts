import { beforeAll, describe, expect, test } from 'bun:test';
import { db } from '../../drizzle';
import { events } from '../schema';
import { roles, type Role } from '../../types';
import { testClient } from 'hono/testing';
import { eq, sql } from 'drizzle-orm';
import { users, userSession } from '../../auth/schema';
import { createUserWithSession } from '../../testHelpers';
import app from '../../app';

const phineasEvent = {
  title: "Phineas' birthday",
  description: 'Yippie!',
  startsAt: new Date(2005, 4, 9, 12, 32, 1, 3),
  public: true
};

const baseRoute = testClient(app).event;

const sessionIds: Partial<Record<Role, string>> = {};

beforeAll(async () => {
  await db.execute(sql`TRUNCATE ${users} CASCADE`);
  await db.execute(sql`TRUNCATE ${userSession} CASCADE`);
  await db.execute(sql`TRUNCATE ${events} CASCADE`);

  for (const role of roles) {
    const { sessionId } = await createUserWithSession(role, {
      name: 'Nishant',
      email: `${role}@ic.ac.uk`,
      password: 'dontheckme'
    });
    sessionIds[role] = sessionId;
  }
});

describe('Events Module > PUT /:id', () => {
  test('an admin can update an event', async () => {
    const eventPre = await db.insert(events).values(phineasEvent).returning();
    const eventId = eventPre[0].id;

    const newTitle = "Ferb's birthday";

    const putRes = await baseRoute[':id'].$put(
      {
        json: {
          title: newTitle
        },
        param: {
          id: eventId.toString()
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.admin}`
        }
      }
    );

    const eventInDbPost = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId));

    expect(eventInDbPost[0].title).toBe(newTitle);
    expect(putRes.status).toBe(201);
  });

  test('cannot update an invalid ID', async () => {
    const putRes = await baseRoute[':id'].$put(
      {
        json: {
          title: 'Doofenshmirtz'
        },
        param: {
          id: '-1'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.god}`
        }
      }
    );

    expect(putRes.status).toBe(404);
  });

  test('cannot update the ID', async () => {
    const eventPre = await db.insert(events).values(phineasEvent).returning();
    const eventId = eventPre[0].id;

    const newTitle = "Ferb's birthday";

    const putRes = await baseRoute[':id'].$put(
      {
        json: {
          // @ts-expect-error ID is invalid, we're testing that.
          id: '127381',
          title: newTitle
        },
        param: {
          id: eventId.toString()
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.admin}`
        }
      }
    );

    expect(putRes.status).toBe(400);
  });

  test("can't update endsAt to be before startsAt ", async () => {
    const eventPre = await db.insert(events).values(phineasEvent).returning();
    const eventId = eventPre[0].id;

    const newDate = new Date(eventPre[0].startsAt);
    newDate.setDate(eventPre[0].startsAt.getDate() - 1);

    const putRes = await baseRoute[':id'].$put(
      {
        json: {
          endsAt: newDate
        },
        param: {
          id: eventId.toString()
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.admin}`
        }
      }
    );

    expect(putRes.status).toBe(400);
  });
});
