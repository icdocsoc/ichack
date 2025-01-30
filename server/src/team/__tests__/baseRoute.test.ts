import { beforeAll, describe, expect, test } from 'bun:test';
import { db } from '../../drizzle';
import { users, userSession } from '../../auth/schema';
import { teams, teamMembers, teamInvites } from '../schema';
import { tomorrow } from '../../testHelpers';
import app from '../../app';
import { testClient } from 'hono/testing';
import { eq, sql } from 'drizzle-orm';
import { qrs } from '../../qr/schema';

const baseRoute = testClient(app).team;
const leader = {
  userId: 'leaderUserId',
  sessionId: 'leaderSessionId'
};
const member = {
  userId: 'memberUserId',
  sessionId: 'memberSessionId'
};
let teamId: number;

beforeAll(async () => {
  await db.execute(sql`TRUNCATE ${users} CASCADE`);
  await db.execute(sql`TRUNCATE ${teams} CASCADE`);
  await db.execute(sql`TRUNCATE ${qrs} CASCADE`);

  // Add the two users we need.
  await db.insert(users).values([
    {
      id: leader.userId,
      name: 'Jay',
      email: 'jay@ic.ac.uk',
      role: 'hacker'
    },
    {
      id: member.userId,
      name: 'Not Jay',
      email: 'notjay@ic.ac.uk',
      role: 'hacker'
    }
  ]);

  await db.insert(qrs).values([
    { userId: leader.userId, uuid: '1234' },
    { userId: member.userId, uuid: '5678' }
  ]);

  await db.insert(userSession).values([
    {
      id: leader.sessionId,
      userId: leader.userId,
      expiresAt: tomorrow
    },
    {
      id: member.sessionId,
      userId: member.userId,
      expiresAt: tomorrow
    }
  ]);

  // This team is needed in every test but the 'create' test, hence we create it here.
  const team = await db
    .insert(teams)
    .values({
      teamName: "Jay's Team"
    })
    .returning();
  await db.insert(teamMembers).values({
    teamId: team[0]!.id,
    userId: leader.userId,
    isLeader: true
  });
  teamId = team[0]!.id;
});

describe('Team module > POST /', () => {
  test('create team', async () => {
    // Delete the team that currently exists
    await db.delete(teamMembers).where(eq(teamMembers.userId, leader.userId));
    await db.delete(teams).where(eq(teams.id, teamId));

    // Create the team
    const res = await baseRoute.$post(
      {
        json: {
          teamName: "Jay's Team"
        }
      },
      {
        headers: {
          Cookie: `auth_session=${leader.sessionId}`
        }
      }
    );

    expect(res.status).toBe(201);
    const { id } = await res.json();

    // Ensure the team & user-team link was created
    const resTeam = await db.select().from(teams).where(eq(teams.id, id));
    expect(resTeam.length).toBe(1);
    expect(resTeam[0]!.teamName).toBe("Jay's Team");

    const userTeamLink = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.teamId, id));
    expect(userTeamLink.length).toBe(1);
    expect(userTeamLink[0]!.userId).toBe(leader.userId);
    teamId = resTeam[0]!.id;
  });

  test("can't create team if in a team - leader", async () => {
    const res = await baseRoute.$post(
      {
        json: {
          teamName: "Jay's Team"
        }
      },
      {
        headers: {
          Cookie: `auth_session=${leader.sessionId}`
        }
      }
    );

    expect(res.status).toBe(400);
    expect(res.text()).resolves.toBe('You are already in a team');
  });

  test("can't create team if in a team - member", async () => {
    // Add member to team
    await db.insert(teamMembers).values({
      userId: member.userId,
      teamId: teamId,
      isLeader: false
    });

    const res = await baseRoute.$post(
      {
        json: {
          teamName: "Jay's Team"
        }
      },
      {
        headers: {
          Cookie: `auth_session=${member.sessionId}`
        }
      }
    );

    expect(res.status).toBe(400);
    expect(res.text()).resolves.toBe('You are already in a team');

    // Remove member from team.
    await db.delete(teamMembers).where(eq(teamMembers.userId, member.userId));
  });
});

describe('Team module > PUT /', () => {
  test('leader can edit team', async () => {
    const dummyNumber = '+447575757575';

    let res = await baseRoute.$put(
      {
        json: {
          teamName: 'winners',
          phone: dummyNumber
        }
      },
      {
        headers: {
          Cookie: `auth_session=${leader.sessionId}`
        }
      }
    );

    expect(res.status).toBe(204);
    let resTeam = await db.select().from(teams).where(eq(teams.id, teamId));
    expect(resTeam.length).toBe(1);
    expect(resTeam[0]!.teamName).toBe('winners');
    expect(resTeam[0]!.phone).toBe(dummyNumber);
  });

  test('leader cannot transfer ownership to user not in team', async () => {
    // Note 'member' has not been added to the team in this test.
    let res = await baseRoute.transfer.$put(
      {
        json: {
          userId: member.userId
        }
      },
      {
        headers: {
          Cookie: `auth_session=${leader.sessionId}`
        }
      }
    );

    expect(res.status).toBe(400);
    expect(res.text()).resolves.toBe('The user is not in the team');
  });

  test('leader can transfer ownership to a user in team', async () => {
    // Add the user to the team then transfer ownership.
    await db.insert(teamMembers).values({
      userId: member.userId,
      teamId: teamId,
      isLeader: false
    });

    const res = await baseRoute.transfer.$put(
      {
        json: {
          userId: member.userId
        }
      },
      {
        headers: {
          Cookie: `auth_session=${leader.sessionId}`
        }
      }
    );

    expect(res.status).toBe(204);

    const newLeaderLink = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, member.userId));
    expect(newLeaderLink.length).toBe(1);
    expect(newLeaderLink[0]!.isLeader).toBeTrue();
    const oldLeaderLink = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, leader.userId));
    expect(oldLeaderLink.length).toBe(1);
    expect(oldLeaderLink[0]!.isLeader).toBeFalse();

    // Return the team leader to the first leader, and remove the added user.
    await db.delete(teamMembers).where(eq(teamMembers.userId, member.userId));
    await db
      .update(teamMembers)
      .set({
        isLeader: true
      })
      .where(eq(teamMembers.userId, leader.userId));
  });
});

describe('Team module > GET /', () => {
  test('cannot retrieve the team when user is not in one', async () => {
    // Ensure member is not in the team.
    await db.delete(teamMembers).where(eq(teamMembers.userId, member.userId));

    const res = await baseRoute.$get(undefined, {
      headers: {
        Cookie: `auth_session=${member.sessionId}`
      }
    });

    expect(res.status).toBe(404);
    expect(res.text()).resolves.toBe('You are not in a team');
  });

  test('can get team', async () => {
    const res = await baseRoute.$get(undefined, {
      headers: {
        Cookie: `auth_session=${leader.sessionId}`
      }
    });

    expect(res.status).toBe(200);
    const teamRes = await res.json();

    const teamInDb = await db.select().from(teams).where(eq(teams.id, teamId));

    const members = await db
      .select({
        name: users.name,
        id: teamMembers.userId,
        leader: teamMembers.isLeader
      })
      .from(teamMembers)
      .innerJoin(users, eq(users.id, teamMembers.userId))
      .where(eq(teamMembers.teamId, teamId));

    const invited = await db
      .select({
        id: teamInvites.userId,
        name: users.name
      })
      .from(teamInvites)
      .innerJoin(users, eq(users.id, teamInvites.userId))
      .where(eq(teamInvites.teamId, teamId));

    expect(teamRes).toEqual({
      members,
      invited,
      ...teamInDb[0]!
    });
  });

  test('QR code must be linked', async () => {
    const qr = await db
      .delete(qrs)
      .where(eq(qrs.userId, leader.userId))
      .returning();

    const res = await baseRoute.$get(undefined, {
      headers: {
        Cookie: `auth_session=${leader.sessionId}`
      }
    });

    // @ts-expect-error As it's the middleware we're hitting.
    expect(res.status).toBe(403);
    expect(res.text()).resolves.toBe(
      'You must be registered to access this route. Have you linked your QR Code?'
    );

    await db.insert(qrs).values(qr);
  });
});

describe('Team module > DELETE /', () => {
  test('can delete team', async () => {
    // Ensure the team exists with a user beforehand.
    let teamInDb = await db
      .select()
      .from(teams)
      .where(eq(teams.id, teamId))
      .innerJoin(teamMembers, eq(teams.id, teamMembers.teamId));
    expect(teamInDb.length).toBe(1);

    const res = await baseRoute.$delete(undefined, {
      headers: {
        Cookie: `auth_session=${leader.sessionId}`
      }
    });

    expect(res.status).toBe(204);

    // Ensure both team and user-team link does not exist.
    teamInDb = await db
      .select()
      .from(teams)
      .where(eq(teams.id, teamId))
      .innerJoin(teamMembers, eq(teams.id, teamMembers.teamId));
    expect(teamInDb.length).toBe(0);

    // Put team and user-team link back.
    const team = await db
      .insert(teams)
      .values({
        teamName: "Jay's Team"
      })
      .returning();
    await db.insert(teamMembers).values({
      teamId: team[0]!.id,
      userId: leader.userId,
      isLeader: true
    });
    teamId = team[0]!.id;
  });

  test('only leader can delete team', async () => {
    // Add member to team.
    await db.insert(teamMembers).values({
      userId: member.userId,
      teamId: teamId,
      isLeader: false
    });

    // Ensure member cannot delete team
    const res = await baseRoute.$delete(undefined, {
      headers: {
        Cookie: `auth_session=${member.sessionId}`
      }
    });

    expect(res.status).toBe(400);
    expect(res.text()).resolves.toBe('Only a leader can delete the team');

    // Remove member
    await db.delete(teamMembers).where(eq(teamMembers.userId, member.userId));
  });
});
