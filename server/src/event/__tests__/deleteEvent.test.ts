import { beforeAll, describe, expect, test } from 'bun:test';
import { db } from '../../drizzle';
import { events } from '../schema';
import { roles } from '../../types';
import { testClient } from 'hono/testing';
import { eq, sql } from 'drizzle-orm';
import { users, userSession } from '../../auth/schema';
import app from '../../app';
import { createUserWithSession } from '../../testHelpers';

const phineasEvent = {
  title: "Phineas' birthday",
  description: 'Yippie!',
  startsAt: new Date(2005, 4, 9, 12, 32, 1, 3),
  public: true
};

const sessionIds: Partial<Record<(typeof roles)[number], string>> = {};

const baseRoute = testClient(app).event;

beforeAll(async () => {
  await db.execute(sql`TRUNCATE ${users} CASCADE`);
  await db.execute(sql`TRUNCATE ${userSession} CASCADE`);
  await db.execute(sql`TRUNCATE ${events} CASCADE`);

  for (const role of roles) {
    const { sessionId } = await createUserWithSession(role, {
      name: 'Jay',
      email: `${role}@ic.ac.uk`,
      password: 'dontheckme'
    });
    sessionIds[role] = sessionId;
  }
});

describe('Events Module > DELETE /:id', () => {
  test('an admin can delete an event', async () => {
    const eventInDbPre = await db
      .insert(events)
      .values(phineasEvent)
      .returning();
    const eventId = eventInDbPre[0].id;

    const delRes = await baseRoute[':id'].$delete(
      { param: { id: eventId.toString() } },
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

    expect(delRes.status).toBe(204);
    expect(eventInDbPost.length).toBe(0);
  });

  test('cannot delete an invalid ID', async () => {
    // Could also test with an absurdly high number but that's
    // ...technically.... not futureproof
    const delRes = await baseRoute[':id'].$delete(
      { param: { id: '-1' } },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.admin}`
        }
      }
    );

    expect(delRes.status).toBe(404);
  });
});
