import { beforeAll, describe, expect, test } from 'bun:test';
import { db } from '../../drizzle';
import { events } from '../schema';
import { roles, type Role } from '../../types';
import { testClient } from 'hono/testing';
import { users, userSession } from '../../auth/schema';
import { createUserWithSession } from '../../testHelpers';
import app from '../../app';
import { sql } from 'drizzle-orm';

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

  await db.insert(events).values([phineasEvent, perryFight]);
});

describe('Events Module > GET /', () => {
  test('unauthenticated user only gets public events', async () => {
    const res = await baseRoute.$get();

    const eventFromRes = await res.json();

    // This should only be the Phineas event.
    expect(eventFromRes.length === 1);
    expect(eventFromRes[0]).toEqual({
      ...phineasEvent,
      startsAt: phineasEvent.startsAt.toISOString(),
      id: expect.any(Number),
      endsAt: null
    });
    expect(eventFromRes[0]!.id).toBeTruthy();

    // Verify correct response code
    expect(res.status).toBe(200);
  });

  test('authenticated user can get all events', async () => {
    for (const role of roles) {
      const res = await baseRoute.$get(undefined, {
        headers: {
          Cookie: `auth_session=${sessionIds[role]}`
        }
      });
      const eventFromRes = await res.json();

      // Can't just expect().toContainEqual() as the id
      // expect.any(Number) doesn't work that way.
      expect(eventFromRes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            ...phineasEvent,
            startsAt: phineasEvent.startsAt.toISOString(),
            id: expect.any(Number),
            endsAt: null,
            locations: expect.arrayContaining(phineasEvent.locations)
          }),
          expect.objectContaining({
            ...perryFight,
            startsAt: perryFight.startsAt.toISOString(),
            endsAt: perryFight.endsAt.toISOString(),
            id: expect.any(Number),
            locations: expect.arrayContaining(perryFight.locations)
          })
        ])
      );

      // Verify correct response code
      expect(res.status).toBe(200);
    }
  });
});
