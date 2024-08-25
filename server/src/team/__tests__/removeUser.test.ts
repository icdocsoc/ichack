import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { db } from '../../drizzle';
import { users, userSession } from '../../auth/schema';
import { teamInvites, teams, teamMembers } from '../schema';
import { tomorrow } from '../../testHelpers';
import app from '../../app';
import { testClient } from 'hono/testing';
import { eq, sql } from 'drizzle-orm';

const baseRoute = testClient(app).api.team;
const testUsers: { userId: string; sessionId: string }[] = [];

const TEAM_LEADER = 0;
const NORMAL_USER = 2;
const NEVER_IN_TEAM = 3;
let teamId: number;

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

  // Creates two teams to be used throughout the tests, lead by x_TEAM_LEADER.
  const team = await db
    .insert(teams)
    .values({
      teamName: "Jay's team"
    })
    .returning();

  teamId = team[0].id;
  await db.insert(teamMembers).values({
    teamId: team[0].id,
    userId: testUsers[TEAM_LEADER].userId,
    isLeader: true
  });
});

describe('Team module > POST /removeUser/:userId', () => {
  test('leader can remove user', async () => {
    // Add a user to the team & try and remove them.
    await db.insert(teamMembers).values({
      userId: testUsers[NORMAL_USER].userId,
      teamId: teamId,
      isLeader: false
    });

    const res = await baseRoute.removeUser[':userId'].$post(
      {
        param: {
          userId: testUsers[NORMAL_USER].userId
        }
      },
      {
        headers: {
          Cookie: `auth_session=${testUsers[TEAM_LEADER].sessionId}`
        }
      }
    );

    expect(res.status).toBe(204);

    // Ensure the link is removed from the DB.
    const userTeamLink = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, testUsers[NORMAL_USER].userId));
    expect(userTeamLink.length).toBe(0);
  });

  test("can't remove yourself (as leader)", async () => {
    const res = await baseRoute.removeUser[':userId'].$post(
      {
        param: {
          userId: testUsers[TEAM_LEADER].userId
        }
      },
      {
        headers: {
          Cookie: `auth_session=${testUsers[TEAM_LEADER].sessionId}`
        }
      }
    );

    expect(res.status).toBe(400);
  });

  test("can't remove user who is not in team", async () => {
    const res = await baseRoute.removeUser[':userId'].$post(
      {
        param: {
          userId: testUsers[NEVER_IN_TEAM].userId
        }
      },
      {
        headers: {
          Cookie: `auth_session=${testUsers[TEAM_LEADER].sessionId}`
        }
      }
    );

    expect(res.status).toBe(404);
  });

  test('only leader can remove user', async () => {
    // Add user-team link in DB.
    await db.insert(teamMembers).values({
      userId: testUsers[NORMAL_USER].userId,
      teamId: teamId,
      isLeader: false
    });

    const res = await baseRoute.removeUser[':userId'].$post(
      {
        param: {
          userId: testUsers[NORMAL_USER].userId
        }
      },
      {
        headers: {
          Cookie: `auth_session=${testUsers[NORMAL_USER].sessionId}`
        }
      }
    );

    expect(res.status).toBe(400);

    // Now remove them anyways, because we hate them.
    await db
      .delete(teamMembers)
      .where(eq(teamMembers.userId, testUsers[NORMAL_USER].userId));
  });
});

describe('Team module > POST /removeUser', () => {
  test('can leave a team', async () => {
    await db.insert(teamMembers).values({
      userId: testUsers[NORMAL_USER].userId,
      teamId: teamId,
      isLeader: false
    });

    const res = await baseRoute.removeUser.$post(undefined, {
      headers: {
        Cookie: `auth_session=${testUsers[NORMAL_USER].sessionId}`
      }
    });

    expect(res.status).toBe(204);

    // Ensure the link is removed in the DB
    const userTeamLink = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, testUsers[NORMAL_USER].userId));
    expect(userTeamLink.length).toBe(0);
  });

  test('leader cannot leave a team', async () => {
    const res = await baseRoute.removeUser.$post(undefined, {
      headers: {
        Cookie: `auth_session=${testUsers[TEAM_LEADER].sessionId}`
      }
    });

    expect(res.status).toBe(400);
  });

  test('can only leave a team if you have a team', async () => {
    const res = await baseRoute.removeUser.$post(undefined, {
      headers: {
        Cookie: `auth_session=${testUsers[NEVER_IN_TEAM].sessionId}`
      }
    });

    expect(res.status).toBe(400);
  });
});

// As to not break other tests, which can't delete because foreign key.
afterAll(async () => {
  await db.delete(teamMembers);
  await db.delete(teamInvites);
  await db.delete(teams);
});
