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
  public: true,
  locations: ['HXLY', 'ICME']
};

const perryFight = {
  title: 'Perry fights Doof',
  description: 'For the millionth time.',
  startsAt: new Date(2021, 5, 3, 12, 32, 1, 3),
  endsAt: new Date(2022, 5, 3, 12, 32, 1, 3),
  public: false,
  locations: ['HXLY', 'ICME']
};

const sessionIds: Partial<Record<Role, string>> = {};
const invalidEvent = {
  title: 'This is an invalid event',
  description: 'The end date is before the start date.',
  startsAt: new Date(2022, 5, 3, 12, 32, 1, 3),
  endsAt: new Date(2021, 5, 3, 12, 32, 1, 3),
  public: true,
  locations: ['HXLY', 'ICME']
};

const baseRoute = testClient(app).event;

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

describe('Events Module > POST /', () => {
  test('an admin can create an event', async () => {
    const res = await baseRoute.$post(
      {
        json: phineasEvent
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.admin}`
        }
      }
    );

    const eventId = await res.json();

    // Verify event was created correctly in DB
    const eventInDb = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId));

    expect(eventInDb.length).toBe(1);
    expect(eventInDb[0]).toMatchObject(phineasEvent);

    // Verify correct response code
    expect(res.status).toBe(201);
  });

  test('a god can create an event', async () => {
    const res = await baseRoute.$post(
      {
        json: perryFight
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.god}`
        }
      }
    );

    const eventId = await res.json();

    // Verify event was created correctly in DB
    const eventInDb = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId));

    expect(eventInDb.length).toBe(1);
    expect(eventInDb[0]).toMatchObject(perryFight);

    // Verify correct response code
    expect(res.status).toBe(201);
  });

  test('no one but god & admin can create an event', async () => {
    for (const role of roles) {
      if (role == 'admin' || role == 'god') continue;
      const res = await baseRoute.$post(
        {
          json: perryFight
        },
        {
          headers: {
            Cookie: `auth_session=${sessionIds[role]}`
          }
        }
      );

      // @ts-expect-error As it's from the middleware.
      expect(res.status).toBe(403);
      expect(res.text()).resolves.toBe(
        'You do not have access to POST /api/event'
      );
    }
  });

  test('end date must be after start date', async () => {
    const res = await baseRoute.$post(
      {
        json: invalidEvent
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.god}`
        }
      }
    );

    // @ts-expect-error as it's from the zod middleware
    expect(res.status).toBe(400);
    expect(res.text()).resolves.toBe('Event must start before it ends.');
  });

  test('`title`, `desc`, `startsAt`,`public`, `locations` are required', async () => {
    const res = await baseRoute.$post(
      {
        // @ts-expect-error Should be invalid, for testing.
        json: {
          title: "Phineas' birthday",
          description: 'Yippie!',
          startsAt: new Date(2005, 4, 9, 12, 32, 1, 3),
          locations: ['HXLY', 'ICME']
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.god}`
        }
      }
    );

    // @ts-expect-error as it's from the zod middleware
    expect(res.status).toBe(400);
    expect(res.text()).resolves.toBe(
      "'public' is either missing or not a boolean"
    );

    const res2 = await baseRoute.$post(
      {
        // @ts-expect-error Should be invalid, for testing.
        json: {
          title: "Phineas' birthday",
          description: 'Yippie!',
          public: true,
          locations: ['HXLY', 'ICME']
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.god}`
        }
      }
    );

    // @ts-expect-error as it's from the zod middleware
    expect(res2.status).toBe(400);
    expect(res2.text()).resolves.toBe(
      "'startsAt' is either missing or not a date"
    );

    const res3 = await baseRoute.$post(
      {
        // @ts-expect-error Should be invalid, for testing.
        json: {
          title: "Phineas' birthday",
          startsAt: new Date(2005, 4, 9, 12, 32, 1, 3),
          public: true,
          locations: ['HXLY', 'ICME']
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.god}`
        }
      }
    );

    // @ts-expect-error as it's from the zod middleware
    expect(res3.status).toBe(400);
    expect(res3.text()).resolves.toBe(
      "'description' is either missing or not a string"
    );

    const res4 = await baseRoute.$post(
      {
        // @ts-expect-error Should be invalid, for testing.
        json: {
          description: 'Yippie!',
          startsAt: new Date(2005, 4, 9, 12, 32, 1, 3),
          public: true,
          locations: ['HXLY', 'ICME']
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.god}`
        }
      }
    );

    // @ts-expect-error as it's from the zod middleware
    expect(res4.status).toBe(400);
    expect(res4.text()).resolves.toBe(
      "'title' is either missing or not a string"
    );

    const res5 = await baseRoute.$post(
      {
        // @ts-expect-error Should be invalid, for testing.
        json: {
          public: true
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.god}`
        }
      }
    );
    // @ts-expect-error as it's from the zod middleware
    expect(res5.status).toBe(400);
    expect(res5.text()).resolves.toBe(
      "'title' is either missing or not a string; 'description' is either missing or not a string; 'startsAt' is either missing or not a date; 'locations' is either missing or not a array"
    );
  });
});
