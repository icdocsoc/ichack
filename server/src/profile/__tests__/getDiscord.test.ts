import { beforeAll, describe, expect, test } from 'bun:test';
import { profiles } from '../schema';
import { db } from '../../drizzle';
import { users, userSession } from '../../auth/schema';
import { createUser } from '../../testHelpers';
import { testClient } from 'hono/testing';
import app from '../../app';
import { eq, sql } from 'drizzle-orm';

const validDiscordId = '1234';
const baseRoute = testClient(app).profile;
let hackerId = '';

beforeAll(async () => {
  await db.execute(sql`TRUNCATE ${userSession} CASCADE`);
  await db.execute(sql`TRUNCATE ${users} CASCADE`);
  await db.execute(sql`TRUNCATE ${profiles} CASCADE`);

  hackerId = await createUser('hacker', {
    name: 'Jay',
    email: 'aa7123@ic.ac.uk',
    password: 'securepass'
  });

  await db.insert(profiles).values({
    id: hackerId,
    photos_opt_out: false,
    dietary_restrictions: [],
    pronouns: 'she/they',
    meals: [false, false, false],
    cvUploaded: false,
    discord_id: validDiscordId
  });
});

describe('Profiles module > GET /discord/:id', async () => {
  test('returns user by Discord ID', async () => {
    const req = await baseRoute.discord[':id'].$get(
      {
        param: { id: validDiscordId }
      },
      {
        headers: {
          Authorization: process.env.CON4_API_KEY!
        }
      }
    );

    expect(req.status).toBe(200);

    const res = await req.json();
    expect(res).toEqual({
      id: hackerId,
      name: 'Jay',
      hackspace: null
    });
  });

  test('requires valid API key', async () => {
    const req = await baseRoute.discord[':id'].$get(
      {
        param: { id: validDiscordId }
      },
      {
        headers: {}
      }
    );

    expect(req.status).toBe(403);

    const req2 = await baseRoute.discord[':id'].$get(
      {
        param: { id: '1234' }
      },
      {
        headers: { Authorization: 'invalid-key' }
      }
    );

    expect(req2.status).toBe(403);
  });

  test('returns 404 if Discord ID not found', async () => {
    const req = await baseRoute.discord[':id'].$get(
      {
        param: { id: 'invalid' }
      },
      {
        headers: {
          Authorization: process.env.CON4_API_KEY!
        }
      }
    );

    expect(req.status).toBe(404);
  });
});
