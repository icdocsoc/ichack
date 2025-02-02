import { beforeEach, describe, expect, test } from 'bun:test';
import { testClient } from 'hono/testing';
import app from '../../app';
import { adminMeta } from '../schema';
import { users } from '../../auth/schema';
import { db } from '../../drizzle';
import { createUserWithSession } from '../../testHelpers';
import { teamMembers, teams } from '../../team/schema';
import { sql } from 'drizzle-orm';

const client = testClient(app);

let adminSessionId: string;
let hackerSessionId: string;

beforeEach(async () => {
  await db.execute(sql`TRUNCATE ${adminMeta}`);
  await db.execute(sql`TRUNCATE ${users} CASCADE`);

  const { sessionId: aSessionId } = await createUserWithSession('admin', {
    name: 'jay is tired',
    email: 'ontheday@gmail.com',
    password: 'Pass#1234'
  });

  adminSessionId = aSessionId;

  const { userId: hUserId, sessionId: hSessionId } =
    await createUserWithSession('hacker', {
      name: 'Jay is rly tired',
      email: 'icquack@wacc.com',
      password: 'Pass#1234'
    });

  hackerSessionId = hSessionId;

  await db.insert(adminMeta).values({ allowSubmissions: true });

  const t = await db
    .insert(teams)
    .values({
      teamName: "Jay's Team"
    })
    .returning();

  await db.insert(teamMembers).values({
    userId: hUserId,
    teamId: t[0]!.id,
    isLeader: true
  });
});

describe('Admin > POST /allowSubmissions', async () => {
  test('an admin can allow submissions', async () => {
    const res = await client.admin.allowSubmissions.$put(
      {
        json: {
          allowSubmissions: false
        }
      },
      {
        headers: {
          Cookie: `auth_session=${adminSessionId}`
        }
      }
    );

    expect(res.status).toBe(204);
    const meta = await db.select().from(adminMeta);
    expect(meta[0]!.allowSubmissions).toBe(false);
  });

  test('only an admin can allow submissions', async () => {
    const res = await client.admin.allowSubmissions.$put(
      {
        json: {
          allowSubmissions: false
        }
      },
      {
        headers: {
          Cookie: `auth_session=${hackerSessionId}`
        }
      }
    );

    // @ts-expect-error middleware
    expect(res.status).toBe(403);
  });

  test('cannot edit teams after submissions are closed', async () => {
    await client.admin.allowSubmissions.$put(
      {
        json: {
          allowSubmissions: false
        }
      },
      {
        headers: {
          Cookie: `auth_session=${adminSessionId}`
        }
      }
    );

    const res = await client.team.$put(
      {
        json: {
          teamName: "i'm crying"
        }
      },
      {
        headers: {
          Cookie: `auth_session=${hackerSessionId}`
        }
      }
    );

    expect(res.status).toBe(403);
  });
});
