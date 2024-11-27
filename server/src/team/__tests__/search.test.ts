import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { db } from '../../drizzle';
import { users, userSession } from '../../auth/schema';
import { teamInvites, teams, teamMembers } from '../schema';
import { tomorrow } from '../../testHelpers';
import app from '../../app';
import { testClient } from 'hono/testing';
import { eq, sql } from 'drizzle-orm';

const baseRoute = testClient(app).team;
const testUsers: { userId: string; sessionId: string }[] = [];

const SEARCHER = 0;
const IN_TEAM = 1;

beforeAll(async () => {
  await db.execute(sql`TRUNCATE ${users} CASCADE`);
  await db.execute(sql`TRUNCATE ${teams} CASCADE`);
  await db.execute(sql`TRUNCATE ${userSession} CASCADE`);
  await db.execute(sql`TRUNCATE ${teamMembers} CASCADE`);
  await db.execute(sql`TRUNCATE ${teamInvites} CASCADE`);

  // Create users to be used during the test.
  // See constants for the purpose of each user.
  for (let i = 0; i < 5; i++) {
    testUsers.push({
      userId: `${i}userId`,
      sessionId: `${i}sessionId`
    });

    await db.insert(users).values({
      id: `${i}userId`,
      name: `Jay ver0.${i}`,
      email: `notjay${i}@ic.ac.uk`,
      role: 'hacker'
    });

    await db.insert(userSession).values({
      id: `${i}sessionId`,
      userId: `${i}userId`,
      expiresAt: tomorrow
    });
  }

  // Creates a team, to test if inTeam bool works.
  const team = await db
    .insert(teams)
    .values({
      teamName: "Jay's team"
    })
    .returning();
  await db.insert(teamMembers).values({
    teamId: team[0].id,
    userId: testUsers[IN_TEAM].userId,
    isLeader: true
  });
});

describe('Team module > POST /search', () => {
  test('can search by partial name', async () => {
    const res = await baseRoute.search.$get(
      {
        query: {
          name: 'Jay'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${testUsers[SEARCHER].sessionId}`
        }
      }
    );

    expect(res.status).toBe(200);
    const users = await res.json();
    // Everyone except the person who searched.
    expect(users.length).toBe(testUsers.length - 1);

    for (let i = 0; i < testUsers.length; i++) {
      // They who searched are not in the result.
      if (i == SEARCHER) continue;

      expect(users).toContainEqual({
        id: testUsers[i].userId,
        name: `Jay ver0.${i}`,
        inTeam: i == IN_TEAM
      });
    }
  });

  test('can search by ONLY exact email', async () => {
    let res = await baseRoute.search.$get(
      {
        query: {
          email: `notjay${IN_TEAM}@`
        }
      },
      {
        headers: {
          Cookie: `auth_session=${testUsers[SEARCHER].sessionId}`
        }
      }
    );

    expect(res.status).toBe(404);

    res = await baseRoute.search.$get(
      {
        query: {
          email: `notjay${IN_TEAM}@ic.ac.uk`
        }
      },
      {
        headers: {
          Cookie: `auth_session=${testUsers[SEARCHER].sessionId}`
        }
      }
    );

    const resUsers = await res.json();
    expect(resUsers.length).toBe(1);
    expect(resUsers[0]).toMatchObject({
      id: testUsers[IN_TEAM].userId,
      name: `Jay ver0.${IN_TEAM}`,
      inTeam: true
    });
  });
});

// As to not break other tests, which can't delete because foreign key.
afterAll(async () => {
  await db.delete(teamMembers);
  await db.delete(teamInvites);
  await db.delete(teams);
});
