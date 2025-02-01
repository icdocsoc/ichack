// supply db with events and users
// test post route adds to db
// test only volunteers and admins can check in
// test a user can only check in once for one event
// test a user can check into multiple events
// test a user can't check into an event that doesn't exist
// test a non existent user can't check in

import { beforeAll, beforeEach, describe, expect, test } from 'bun:test';
import { db } from '../../drizzle';
import { eventCheckIn, events } from '../schema';
import { roles, type Role } from '../../types';
import { testClient } from 'hono/testing';
import { users, userSession } from '../../auth/schema';
import { createUserWithSession } from '../../testHelpers';
import app from '../../app';
import { and, eq, sql } from 'drizzle-orm';
import { hash } from 'argon2';
import { hashOptions } from '../../auth/lucia';

const phineasEvent = {
  id: 1,
  title: "Phineas' birthday",
  description: 'Yippie!',
  startsAt: new Date(2005, 4, 9, 12, 32, 1, 3),
  public: true,
  locations: ['HXLY' as const, 'ICME' as const]
};

const perryFight = {
  id: 2,
  title: 'Perry fights Doof',
  description: 'For the millionth time.',
  startsAt: new Date(2021, 5, 3, 12, 32, 1, 3),
  endsAt: new Date(2022, 5, 3, 12, 32, 1, 3),
  public: false,
  locations: ['HXLY' as const, 'ICME' as const]
};

const baseRoute = testClient(app).event;
const sessionIds: Partial<Record<Role, string>> = {};
let hacker1: { userId: string; sessionId: string };
let volunteer1: { userId: string; sessionId: string };
let admin1: { userId: string; sessionId: string };

beforeAll(async () => {
  await db.execute(sql`TRUNCATE ${users} CASCADE`);
  await db.execute(sql`TRUNCATE ${userSession} CASCADE`);
  await db.execute(sql`TRUNCATE ${events} CASCADE`);
  await db.execute(sql`TRUNCATE ${eventCheckIn} CASCADE`);

  for (const role of roles) {
    const { sessionId } = await createUserWithSession(role, {
      name: 'Nishant',
      email: `${role}@ic.ac.uk`,
      password: 'dontheckme'
    });
    sessionIds[role] = sessionId;
  }

  await db.insert(events).values([phineasEvent, perryFight]);
  hacker1 = await createUserWithSession('hacker', {
    name: 'JoshXL',
    email: 'rahhhhh@gmail.com',
    password: await hash('Pass#1234', hashOptions)
  });

  volunteer1 = await createUserWithSession('volunteer', {
    name: 'Volunteer',
    email: 'john@gmail.com',
    password: await hash('Pass#1234', hashOptions)
  });

  admin1 = await createUserWithSession('admin', {
    name: 'Admin',
    email: 'admin@john.com',
    password: await hash('Pass#1234', hashOptions)
  });
});

describe('Events Module: Check In > POST', () => {
  beforeEach(async () => {
    await db.execute(sql`TRUNCATE ${eventCheckIn} CASCADE`);
  });
  test('route adds to db', async () => {
    const res = await baseRoute['check-in'].$post(
      {
        json: {
          eventId: phineasEvent.id,
          userId: hacker1.userId
        }
      },
      {
        headers: {
          Cookie: `auth_session=${volunteer1.sessionId}`
        }
      }
    );

    expect(res.status).toBe(201);
    const checkIn = await db
      .select()
      .from(eventCheckIn)
      .where(
        and(
          eq(eventCheckIn.eventId, phineasEvent.id),
          eq(eventCheckIn.userId, hacker1.userId)
        )
      );
    expect(checkIn[0]).toMatchObject({
      eventId: phineasEvent.id,
      userId: hacker1.userId
    });
  });

  test('only volunteers and admins can check in users', async () => {
    const res = await baseRoute['check-in'].$post(
      {
        json: {
          eventId: phineasEvent.id,
          userId: hacker1.userId
        }
      },
      {
        headers: {
          Cookie: `auth_session=${hacker1.sessionId}`
        }
      }
    );

    // @ts-expect-error Auth middleware.
    expect(res.status).toBe(403);
  });

  test('a user can only check in once for one event', async () => {
    await db.insert(eventCheckIn).values({
      eventId: phineasEvent.id,
      userId: hacker1.userId
    });

    const res = await baseRoute['check-in'].$post(
      {
        json: {
          eventId: phineasEvent.id,
          userId: hacker1.userId
        }
      },
      {
        headers: {
          Cookie: `auth_session=${volunteer1.sessionId}`
        }
      }
    );

    expect(res.status).toBe(400);
    expect(res.text()).resolves.toBe('Already checked in.');
  });

  test('a user can check into multiple events', async () => {
    const res1 = await baseRoute['check-in'].$post(
      {
        json: {
          eventId: phineasEvent.id,
          userId: hacker1.userId
        }
      },
      {
        headers: {
          Cookie: `auth_session=${volunteer1.sessionId}`
        }
      }
    );

    const res2 = await baseRoute['check-in'].$post(
      {
        json: {
          eventId: perryFight.id,
          userId: hacker1.userId
        }
      },
      {
        headers: {
          Cookie: `auth_session=${volunteer1.sessionId}`
        }
      }
    );
    expect(res1.status).toBe(201);
    expect(res2.status).toBe(201);
  });

  test("a user can't check into an event that doesn't exist", async () => {
    const res = await baseRoute['check-in'].$post(
      {
        json: {
          eventId: 999,
          userId: hacker1.userId
        }
      },
      {
        headers: {
          Cookie: `auth_session=${volunteer1.sessionId}`
        }
      }
    );

    expect(res.status).toBe(404);
    expect(res.text()).resolves.toBe('Event does not exist.');
  });

  test("a non existent user can't check in", async () => {
    const res = await baseRoute['check-in'].$post(
      {
        json: {
          eventId: phineasEvent.id,
          userId: 'nonexistent'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${volunteer1.sessionId}`
        }
      }
    );

    expect(res.status).toBe(404);
    expect(res.text()).resolves.toBe('User does not exist.');
  });
});
