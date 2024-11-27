import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { db } from '../../drizzle';
import { users, userSession } from '../../auth/schema';
import { teamInvites, teams, teamMembers } from '../schema';
import { tomorrow } from '../../testHelpers';
import app from '../../app';
import { testClient } from 'hono/testing';
import { and, eq, not, sql } from 'drizzle-orm';

const baseRoute = testClient(app).team;
const testUsers: { userId: string; sessionId: string }[] = [];
// In order to test the seven user limit.
const sixUsers: { userId: string; sessionId: string }[] = [];

const FIRST_TEAM_LEADER = 0;
const SECOND_TEAM_LEADER = 1;
const NORMAL_USER = 2;
const NEVER_IN_TEAM = 3;
let firstTeamId: number;
let secondTeamId: number;

beforeAll(async () => {
  await db.execute(sql`TRUNCATE ${users} CASCADE`);
  await db.execute(sql`TRUNCATE ${teams} CASCADE`);
  await db.execute(sql`TRUNCATE ${userSession} CASCADE`);
  await db.execute(sql`TRUNCATE ${teamMembers} CASCADE`);
  await db.execute(sql`TRUNCATE ${teamInvites} CASCADE`);

  // Create users to be used during the test.
  // See constants for the purpose of each user.
  for (let i = 0; i < 4; i++) {
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
    .values([
      {
        teamName: "Jay's team"
      },
      {
        teamName: "Fake Jay's Team"
      }
    ])
    .returning();

  firstTeamId = team[0].id;
  secondTeamId = team[1].id;
  await db.insert(teamMembers).values([
    {
      teamId: team[0].id,
      userId: testUsers[FIRST_TEAM_LEADER].userId,
      isLeader: true
    },
    {
      teamId: team[1].id,
      userId: testUsers[SECOND_TEAM_LEADER].userId,
      isLeader: true
    }
  ]);

  // Creates six users to use to test the 6 member limit
  for (let i = 0; i < 6; i++) {
    sixUsers.push({
      userId: `stressed${i}userId`,
      sessionId: `stressed${i}sessionId`
    });

    await db.insert(users).values({
      id: `stressed${i}userId`,
      name: `Jay Stressed${i}`,
      email: `stresstester${i}@ic.ac.uk`,
      role: 'hacker'
    });

    await db.insert(userSession).values({
      id: `stressed${i}sessionId`,
      userId: `stressed${i}userId`,
      expiresAt: tomorrow
    });
  }
});

/*
There exist two teams
Team 1) testUsers[FIRST_TEAM_LEADER].userId
Team 2) testUsers[SECOND_TEAM_LEADER].userId
*/

describe('Team module > POST /invite', () => {
  test('can invite a valid user', async () => {
    // Invite NORMAL_USER to first team
    const res = await baseRoute.invite.$post(
      {
        json: {
          userId: testUsers[NORMAL_USER].userId
        }
      },
      {
        headers: {
          Cookie: `auth_session=${testUsers[FIRST_TEAM_LEADER].sessionId}`
        }
      }
    );

    expect(res.status).toBe(204);

    // Check that they're in the team.
    const invite = await db
      .select()
      .from(teamInvites)
      .where(eq(teamInvites.userId, testUsers[NORMAL_USER].userId));
    expect(invite.length).toBe(1);
    expect(invite[0].userId).toBe(testUsers[NORMAL_USER].userId);
    expect(invite[0].teamId).toBe(firstTeamId);

    // Remove them from the team
    await db
      .delete(teamInvites)
      .where(eq(teamInvites.userId, testUsers[NORMAL_USER].userId));
  });

  test("can't reinvite user to the same team", async () => {
    // Add invite to team
    await db.insert(teamInvites).values({
      teamId: firstTeamId,
      userId: testUsers[NORMAL_USER].userId
    });

    const res = await baseRoute.invite.$post(
      {
        json: {
          userId: testUsers[NORMAL_USER].userId
        }
      },
      {
        headers: {
          Cookie: `auth_session=${testUsers[FIRST_TEAM_LEADER].sessionId}`
        }
      }
    );

    expect(res.status).toBe(409);
    await db
      .delete(teamInvites)
      .where(eq(teamInvites.userId, testUsers[NORMAL_USER].userId));
  });

  test("can't invite an invalid user", async () => {
    const res = await baseRoute.invite.$post(
      {
        json: {
          userId: 'invalid'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${testUsers[FIRST_TEAM_LEADER].sessionId}`
        }
      }
    );

    expect(res.status).toBe(404);
  });

  test('can invite a user invited by someone else', async () => {
    // Add an invite to first team.
    await db.insert(teamInvites).values({
      userId: testUsers[NORMAL_USER].userId,
      teamId: firstTeamId
    });

    // Try and invite to second team.
    const res = await baseRoute.invite.$post(
      {
        json: {
          userId: testUsers[NORMAL_USER].userId
        }
      },
      {
        headers: {
          Cookie: `auth_session=${testUsers[SECOND_TEAM_LEADER].sessionId}`
        }
      }
    );

    expect(res.status).toBe(204);

    // Remove invite we added
    await db
      .delete(teamInvites)
      .where(eq(teamInvites.userId, testUsers[NORMAL_USER].userId));
  });

  test.skip("can't invite user already in team", async () => {
    // Apparently we should be able to. Remove test, or remove skip based on meeting.

    // Leads first team, so should not be able to be invited again.
    const res = await baseRoute.invite.$post(
      {
        json: {
          userId: testUsers[FIRST_TEAM_LEADER].userId
        }
      },
      {
        headers: {
          Cookie: `auth_session=${testUsers[SECOND_TEAM_LEADER].sessionId}`
        }
      }
    );

    expect(res.status).toBe(409);
  });

  test('only leader can invite user', async () => {
    // Add user NORMAL_USER to team
    await db.insert(teamMembers).values({
      userId: testUsers[NORMAL_USER].userId,
      teamId: firstTeamId,
      isLeader: false
    });

    // See if NORMAL_USER can invite someone else.
    const res = await baseRoute.invite.$post(
      {
        json: {
          userId: testUsers[NEVER_IN_TEAM].userId
        }
      },
      {
        headers: {
          Cookie: `auth_session=${testUsers[NORMAL_USER].sessionId}`
        }
      }
    );

    expect(res.status).toBe(400);

    // Remove then from team.
    await db
      .delete(teamMembers)
      .where(eq(teamMembers.userId, testUsers[NORMAL_USER].userId));
  });
});

describe('Team module > POST /acceptInvite', () => {
  test('can accept an invite, and wipes other invites', async () => {
    // Add two invites
    await db.insert(teamInvites).values([
      {
        userId: testUsers[NORMAL_USER].userId,
        teamId: firstTeamId
      },
      {
        userId: testUsers[NORMAL_USER].userId,
        teamId: secondTeamId
      }
    ]);

    // Accept one
    const res = await baseRoute.acceptInvite.$post(
      {
        json: {
          teamId: firstTeamId
        }
      },
      {
        headers: {
          Cookie: `auth_session=${testUsers[NORMAL_USER].sessionId}`
        }
      }
    );

    // Ensure the accept works
    expect(res.status).toBe(204);
    const teamLink = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, testUsers[NORMAL_USER].userId));
    expect(teamLink.length).toBe(1);
    expect(teamLink[0].userId).toBe(testUsers[NORMAL_USER].userId);
    expect(teamLink[0].teamId).toBe(firstTeamId);

    // And that it wiped the second invite.
    const team2 = await db
      .select()
      .from(teamInvites)
      .where(eq(teamInvites.userId, testUsers[NORMAL_USER].userId));
    expect(team2.length).toBe(0);

    // Now remove user from team
    await db
      .delete(teamMembers)
      .where(eq(teamMembers.userId, testUsers[NORMAL_USER].userId));
  });

  test("can't accept an invite that doesn't exist", async () => {
    const res = await baseRoute.acceptInvite.$post(
      {
        json: {
          teamId: firstTeamId
        }
      },
      {
        headers: {
          Cookie: `auth_session=${testUsers[NEVER_IN_TEAM].sessionId}`
        }
      }
    );

    expect(res.status).toBe(400);
  });

  test("cannot accept someone else's invite", async () => {
    // Invite NORMAL_USER
    await db.insert(teamInvites).values({
      teamId: firstTeamId,
      userId: testUsers[NORMAL_USER].userId
    });

    // Attempt to join as NEVER_IN_TEAM
    const res = await baseRoute.acceptInvite.$post(
      {
        json: {
          teamId: firstTeamId
        }
      },
      {
        headers: {
          Cookie: `auth_session=${testUsers[NEVER_IN_TEAM].sessionId}`
        }
      }
    );

    expect(res.status).toBe(400);

    await db
      .delete(teamInvites)
      .where(eq(teamInvites.userId, testUsers[NORMAL_USER].userId));
  });

  test('cannot accept an invite if team is full', async () => {
    // We should never reach this due to the constraints on /invite,
    // but just in case.

    // Add the first 5 users
    for (let i = 0; i < sixUsers.length - 1; i++) {
      await db.insert(teamMembers).values({
        teamId: firstTeamId,
        userId: sixUsers[i].userId,
        isLeader: false
      });
    }

    // Add an illegal invite for the 6th user
    await db.insert(teamInvites).values({
      teamId: firstTeamId,
      userId: sixUsers[sixUsers.length - 1].userId
    });

    // Try and accept this illegal invite
    const res = await baseRoute.acceptInvite.$post(
      {
        json: {
          teamId: firstTeamId
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sixUsers[sixUsers.length - 1].sessionId}`
        }
      }
    );

    expect(res.status).toBe(403);

    // Remove the invite and users
    await db.delete(teamInvites).where(eq(teamInvites.teamId, firstTeamId));
    await db
      .delete(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, firstTeamId),
          not(eq(teamMembers.userId, testUsers[FIRST_TEAM_LEADER].userId))
        )
      );
  });

  test('once a team is full, all other invites are deleted', async () => {
    // Add four members, so team is at five members.
    let i: number;
    for (i = 0; i < sixUsers.length - 2; i++) {
      await db.insert(teamMembers).values({
        teamId: firstTeamId,
        userId: sixUsers[i].userId,
        isLeader: false
      });
    }

    // Add an invite for two other users
    for (; i < sixUsers.length; i++) {
      await db.insert(teamInvites).values({
        teamId: firstTeamId,
        userId: sixUsers[i].userId
      });
    }

    // Accept one of the invites.
    const res = await baseRoute.acceptInvite.$post(
      {
        json: {
          teamId: firstTeamId
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sixUsers[sixUsers.length - 1].sessionId}`
        }
      }
    );

    expect(res.status).toBe(204);

    // Check that no other invites to the team exist.
    const invites = await db
      .select()
      .from(teamInvites)
      .where(eq(teamInvites.teamId, firstTeamId));
    expect(invites.length).toBe(0);

    // Remove the added users.
    await db
      .delete(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, firstTeamId),
          not(eq(teamMembers.userId, testUsers[FIRST_TEAM_LEADER].userId))
        )
      );
  });
});

describe('Team module > POST /removeInvite', () => {
  test('can decline an invite', async () => {
    // Add invite & deny it
    await db.insert(teamInvites).values({
      teamId: firstTeamId,
      userId: testUsers[NORMAL_USER].userId
    });

    const res = await baseRoute.removeInvite.$post(
      {
        json: {
          teamId: firstTeamId
        }
      },
      {
        headers: {
          Cookie: `auth_session=${testUsers[NORMAL_USER].sessionId}`
        }
      }
    );

    expect(res.status).toBe(204);

    // Ensure it is removed from the db on deny.
    const invite = await db
      .select()
      .from(teamInvites)
      .where(eq(teamInvites.userId, testUsers[NORMAL_USER].userId));
    expect(invite.length).toBe(0);
  });

  test("can't decline an invite that doesn't exist", async () => {
    // By default, no invite exists.

    const res = await baseRoute.removeInvite.$post(
      {
        json: {
          teamId: firstTeamId
        }
      },
      {
        headers: {
          Cookie: `auth_session=${testUsers[NEVER_IN_TEAM].sessionId}`
        }
      }
    );

    expect(res.status).toBe(404);
  });
});

// As to not break other tests, which can't delete because foreign key.
afterAll(async () => {
  await db.delete(teamMembers);
  await db.delete(teamInvites);
  await db.delete(teams);
});
