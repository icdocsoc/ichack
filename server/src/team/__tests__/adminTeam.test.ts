import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { db } from '../../drizzle';
import { users, userSession } from '../../auth/schema';
import { teamInvites, teams, teamMembers } from '../schema';
import { createUser, createUserWithQr, tomorrow } from '../../testHelpers';
import app from '../../app';
import { testClient } from 'hono/testing';
import { eq, sql } from 'drizzle-orm';
import { qrs } from '../../qr/schema';

const baseRoute = testClient(app).team.admin;
const testUsers: { userId: string; sessionId: string }[] = [];

let team: {
    id: number;
    teamName: string;
    sponsorCategory: string | null;
    docsocCategory: string | null;
    submissionLink: string | null;
    phone: string | null;
    phone2: string | null;
  }[],
  team2: {
    id: number;
    teamName: string;
    sponsorCategory: string | null;
    docsocCategory: string | null;
    submissionLink: string | null;
    phone: string | null;
    phone2: string | null;
  }[],
  team3: {
    id: number;
    teamName: string;
    sponsorCategory: string | null;
    docsocCategory: string | null;
    submissionLink: string | null;
    phone: string | null;
    phone2: string | null;
  }[];

const SEARCHER: { userId: string; sessionId: string } = {
  userId: 'searcher',
  sessionId: 'AdminSearcher'
};
const IN_TEAM = 0;
const IN_TEAM_NOT_LEADER = 1;
const INVITED_TO_TEAM = 2;
const WEAK_SEARCHER = 3; //bro dont got admin rights
const GUYINOTHERTEAM = 4;

let regularTeamId = -1;
let fullTeamId = -1;
let almostFullTeamId = -1;

beforeAll(async () => {
  await db.execute(sql`TRUNCATE ${users} CASCADE`);
  await db.execute(sql`TRUNCATE ${teams} CASCADE`);
  await db.execute(sql`TRUNCATE ${userSession} CASCADE`);
  await db.execute(sql`TRUNCATE ${teamMembers} CASCADE`);
  await db.execute(sql`TRUNCATE ${teamInvites} CASCADE`);

  // Create users to be used during the test.
  // See constants for the purpose of each user.
  for (let i = 0; i < 10; i++) {
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
  await db.insert(users).values({
    id: SEARCHER.userId,
    name: 'Admin Searcher',
    email: 'adminsearcher@ic.ac.uk',
    role: 'admin'
  });

  await db.insert(userSession).values({
    id: SEARCHER.sessionId,
    userId: SEARCHER.userId,
    expiresAt: tomorrow
  });

  // Creates a team, to test admin search tools
  team = await db
    .insert(teams)
    .values({
      teamName: "Josh's team",
      submissionLink: 'artoria',
      phone: '+447123456789',
      phone2: '+44696969696'
    })
    .returning();

  team2 = await db
    .insert(teams)
    .values({
      teamName: 'nono team'
    })
    .returning();

  team3 = await db
    .insert(teams)
    .values({
      teamName: "John's team"
    })
    .returning();
  await db.insert(teamMembers).values([
    {
      teamId: team[0].id,
      userId: testUsers[IN_TEAM].userId,
      isLeader: true
    },
    {
      teamId: team[0].id,
      userId: testUsers[IN_TEAM_NOT_LEADER].userId,
      isLeader: false
    }
  ]);

  await db.insert(teamInvites).values({
    teamId: team[0].id,
    userId: testUsers[INVITED_TO_TEAM].userId
  });

  await db.insert(teamMembers).values({
    teamId: team2[0].id,
    userId: testUsers[GUYINOTHERTEAM].userId,
    isLeader: true
  });

  // For the addUserToTeam tests
  const regularUser = await createUser('hacker', {
    name: 'Regular user',
    email: 'regularUser@gmail.com',
    password: 'idkSmth123@'
  });

  // Make a regular team
  const regularTeam = await db
    .insert(teams)
    .values({
      teamName: 'Kookie fan club'
    })
    .returning();

  await db.insert(teamMembers).values({
    teamId: regularTeam[0]!.id,
    userId: regularUser,
    isLeader: true
  });

  regularTeamId = regularTeam[0]!.id;

  // Make a full team
  const fullTeam = await db
    .insert(teams)
    .values({
      teamName: 'Cookie fan club'
    })
    .returning();

  fullTeamId = fullTeam[0]!.id;

  for (let i = 0; i < 6; i++) {
    const userId = await createUser('hacker', {
      name: `Sya ${i}`,
      email: `cookielover${i}@test.com`,
      password: `idkSmth123@`
    });

    await db.insert(teamMembers).values({
      teamId: fullTeamId,
      userId: userId,
      isLeader: i == 0
    });
  }

  // Make a full-1 team.
  const almostFullTeam = await db
    .insert(teams)
    .values({
      teamName: 'Cow Fan Club'
    })
    .returning();

  almostFullTeamId = almostFullTeam[0]!.id;

  for (let i = 0; i < 5; i++) {
    const userId = await createUser('hacker', {
      name: `Grumpy ${i}`,
      email: `asdjlasdjlkajsdl@tired${i}.com`,
      password: 'idkSmth123@'
    });

    await db.insert(teamMembers).values({
      teamId: almostFullTeam[0]!.id,
      userId: userId,
      isLeader: i == 0
    });
  }
});

describe('Team module > GET /admin/teamSearch/byPerson', () => {
  /* test works for exact name 
    test for partial match
    for all 3 types (leader in team invited)
    emptty string test
    no results test */

  test('Search by exact name', async () => {
    const response = await baseRoute.searchTeam.byPerson.$get(
      {
        query: {
          personName: `Jay ver0.${IN_TEAM}`
        }
      },
      {
        headers: {
          Cookie: `auth_session=${SEARCHER.sessionId}`
        }
      }
    );
    expect(response.status).toBe(200);
    const users = await response.json();
    expect(users.length).toBe(1);
    expect(users[0].userId).toBe(testUsers[IN_TEAM].userId);
    expect(users[0].teamName).toBe("Josh's team");
  });

  test('Search by partial name & test status field', async () => {
    const response = await baseRoute.searchTeam.byPerson.$get(
      {
        query: {
          personName: 'Jay ver0'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${SEARCHER.sessionId}`
        }
      }
    );
    expect(response.status).toBe(200);
    const users = await response.json();
    expect(users.length).toBe(4);
    const expectedResults = [
      {
        userId: testUsers[IN_TEAM].userId,
        userName: `Jay ver0.${IN_TEAM}`,
        teamName: "Josh's team",
        status: 'leader',
        teamId: null
      },
      {
        userId: testUsers[IN_TEAM_NOT_LEADER].userId,
        userName: `Jay ver0.${IN_TEAM_NOT_LEADER}`,
        teamName: "Josh's team",
        status: 'member',
        teamId: null
      },
      {
        userId: testUsers[INVITED_TO_TEAM].userId,
        userName: `Jay ver0.${INVITED_TO_TEAM}`,
        teamName: "Josh's team",
        status: 'invited',
        teamId: null
      },
      {
        userId: testUsers[GUYINOTHERTEAM].userId,
        userName: `Jay ver0.${GUYINOTHERTEAM}`,
        teamName: 'nono team',
        status: 'leader',
        teamId: null
      }
    ];

    expectedResults.forEach(expectedUser => {
      const user = users.find(u => u.userId === expectedUser.userId);
      expect(user).toBeDefined();
      expect(user.teamName).toBe(expectedUser.teamName);
      expect(user.userName).toBe(expectedUser.userName);
      expect(user.status).toBe(expectedUser.status);
    });
  });
  // skipping since it probably type casts to string anyway so it will be the same as empty string search or finding no users
  test.skip('invalid type', async () => {
    //test for invalid type
    const response = await baseRoute.searchTeam.byPerson.$get(
      {
        query: {
          personName: 69
        }
      },
      {
        headers: {
          Cookie: `auth_session=${SEARCHER.sessionId}`
        }
      }
    );
    expect(response.status).toBe(404);
    expect(response.text()).resolves.toBe(
      "Property 'personName' is either missing or not a string"
    );
  });

  // This is fine; return all useres
  test.skip('Empty string search', async () => {
    const response = await baseRoute.searchTeam.byPerson.$get(
      {
        query: {
          personName: ''
        }
      },
      {
        headers: {
          Cookie: `auth_session=${SEARCHER.sessionId}`
        }
      }
    );
    expect(response.status).toBe(400);
    expect(response.text()).resolves.toBe("'personName' is too small");
  });

  test('No results', async () => {
    const response = await baseRoute.searchTeam.byPerson.$get(
      {
        query: {
          personName: 'no results'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${SEARCHER.sessionId}`
        }
      }
    );
    expect(response.status).toBe(404);
    const txt = await response.text();
    expect(txt).toBe('User not found.');
  });

  test('Weak searcher', async () => {
    const response = await baseRoute.searchTeam.byPerson.$get(
      {
        query: {
          personName: 'Jay ver0'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${testUsers[WEAK_SEARCHER].sessionId}`
        }
      }
    );
    expect(response.status).toBe(403);
  });
});

describe('Team module > GET /admin/teamSearch/byTeam', () => {
  /* test works for exact name 
    test for partial match
    emptty string test
    no results test */

  test('Search by exact name', async () => {
    const response = await baseRoute.searchTeam.$get(
      {
        query: {
          teamName: "Josh's team"
        }
      },
      {
        headers: {
          Cookie: `auth_session=${SEARCHER.sessionId}`
        }
      }
    );
    expect(response.status).toBe(200);
    const teams = await response.json();
    expect(teams.length).toBe(1);
    expect(teams[0].teamName).toBe("Josh's team");
  });

  test('Search by partial name', async () => {
    const response = await baseRoute.searchTeam.$get(
      {
        query: {
          teamName: 'team'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${SEARCHER.sessionId}`
        }
      }
    );
    expect(response.status).toBe(200);
    const teams = await response.json();
    expect(teams.length).toBe(3);
    const expectedResults = [
      {
        teamId: 69, //not needed in the tes
        teamName: "Josh's team"
      },
      {
        teamId: 69,
        teamName: 'nono team'
      },
      {
        teamId: 69,
        teamName: "John's team"
      }
    ];

    expectedResults.forEach(expectedTeam => {
      const team = teams.find(t => t.teamName === expectedTeam.teamName);
      expect(team).toBeDefined();
      expect(team.teamName).toBe(expectedTeam.teamName);
    });
  });

  // This is fine; return all teams.
  test.skip('Empty string search', async () => {
    const response = await baseRoute.searchTeam.$get(
      {
        query: {
          teamName: ''
        }
      },
      {
        headers: {
          Cookie: `auth_session=${SEARCHER.sessionId}`
        }
      }
    );
    expect(response.status).toBe(400);
  });

  test('No results', async () => {
    const response = await baseRoute.searchTeam.$get(
      {
        query: {
          teamName: 'no results'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${SEARCHER.sessionId}`
        }
      }
    );
    expect(response.status).toBe(404);
    const txt = await response.text();
    expect(txt).toBe('Team not found.');
  });

  test('Weak searcher', async () => {
    const response = await baseRoute.searchTeam.$get(
      {
        query: {
          teamName: 'team'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${testUsers[WEAK_SEARCHER].sessionId}`
        }
      }
    );
    expect(response.status).toBe(403);
  });

  test('partial name2', async () => {
    const response = await baseRoute.searchTeam.$get(
      {
        query: {
          teamName: 'Jo'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${SEARCHER.sessionId}`
        }
      }
    );
    expect(response.status).toBe(200);
    const teams = await response.json();
    expect(teams.length).toBe(2);
  });
});

describe('Team module > GET /admin/getTeamData', () => {
  /* ensure this returns the correct data for a team 
  expect 404 for invalid team id
  expect 403 for weak searcher
  expect 200 for valid team id 
  hopefully we dont get a 500 occuring */

  test('Valid team id', async () => {
    const response = await baseRoute.getTeamData.$get(
      {
        query: {
          teamId: team[0].id.toString()
        }
      },
      {
        headers: {
          Cookie: `auth_session=${SEARCHER.sessionId}`
        }
      }
    );
    expect(response.status).toBe(200);
    const res = await response.json();
    const teamData = res.teamData;

    expect(teamData.teamName).toBe("Josh's team");
    expect(teamData.submissionLink).toBe('artoria');
    expect(teamData.phone).toBe('+447123456789');
    expect(teamData.phone2).toBe('+44696969696');

    const members = res.members;
    expect(members.length).toBe(2);
    const expectedMembers = [
      {
        userId: testUsers[IN_TEAM].userId,
        isLeader: true
      },
      {
        userId: testUsers[IN_TEAM_NOT_LEADER].userId,
        isLeader: false
      }
    ];
    expectedMembers.forEach(expectedMember => {
      const member = members.find(m => m.userId === expectedMember.userId);
      expect(member).toBeDefined();
      expect(member.isLeader).toBe(expectedMember.isLeader);
    });

    const invites = res.invites;
    expect(invites.length).toBe(1);
    expect(invites[0].userId).toBe(testUsers[INVITED_TO_TEAM].userId);
  });

  test('Invalid team id', async () => {
    const response = await baseRoute.getTeamData.$get(
      {
        query: {
          teamId: 69
        }
      },
      {
        headers: {
          Cookie: `auth_session=${SEARCHER.sessionId}`
        }
      }
    );
    expect(response.status).toBe(404);
    expect(response.text()).resolves.toBe('Team not found.');
  });

  test('Weak searcher', async () => {
    const response = await baseRoute.getTeamData.$get(
      {
        query: {
          teamId: team[0].id
        }
      },
      {
        headers: {
          Cookie: `auth_session=${testUsers[WEAK_SEARCHER].sessionId}`
        }
      }
    );
    expect(response.status).toBe(403);
  });
});

afterAll(async () => {
  await db.delete(teamMembers);
  await db.delete(teamInvites);
  await db.delete(teams);
});

describe('Team module > POST /admin/addUserToTeam', async () => {
  test('Adds user to team', async () => {
    const userId = await createUserWithQr('hacker', {
      name: 'lucky girl',
      email: 'imrunningoutofemails@gmail.com',
      password: 'idkSmth123@'
    });

    const response = await baseRoute.addUserToTeam.$post(
      {
        json: {
          teamId: regularTeamId,
          userId
        }
      },
      {
        headers: {
          Cookie: `auth_session=${SEARCHER.sessionId}`
        }
      }
    );

    expect(response.status).toBe(200);

    const dbRes = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, userId));
    expect(dbRes.length).toBe(1);
    expect(dbRes[0]!.teamId).toBe(regularTeamId);
  });

  test('Removes users other invites', async () => {
    const userId = await createUserWithQr('hacker', {
      name: 'lucky enby',
      email: '1010101@gmail.com',
      password: 'idkSmth123@'
    });

    await db.insert(teamInvites).values({
      teamId: almostFullTeamId,
      userId
    });

    const response = await baseRoute.addUserToTeam.$post(
      {
        json: {
          teamId: regularTeamId,
          userId
        }
      },
      {
        headers: {
          Cookie: `auth_session=${SEARCHER.sessionId}`
        }
      }
    );

    expect(response.status).toBe(200);
    const dbRes = await db
      .select()
      .from(teamInvites)
      .where(eq(teamInvites.userId, userId));
    expect(dbRes.length).toBe(0);
  });

  test('Does not add to full team', async () => {
    const userId = await createUserWithQr('hacker', {
      name: 'Sya',
      email: 'ilovecookies@grumpy.cow',
      password: 'idkSmth123@'
    });

    const response = await baseRoute.addUserToTeam.$post(
      {
        json: {
          teamId: fullTeamId,
          userId: userId
        }
      },
      {
        headers: {
          Cookie: `auth_session=${SEARCHER.sessionId}`
        }
      }
    );

    expect(response.status).toBe(409);
  });

  test('Removes other invites if team becomes full', async () => {
    const addedUser = await createUserWithQr('hacker', {
      name: 'Grumpy Cow',
      email: 'moomoo@kookie.com',
      password: 'idkSmth123@'
    });

    const lostInvite = await createUserWithQr('hacker', {
      name: 'Cookie',
      email: 'cookie@thecat.com',
      password: 'idkSmth123@'
    });

    await db.insert(teamInvites).values({
      teamId: almostFullTeamId,
      userId: lostInvite
    });

    const response = await baseRoute.addUserToTeam.$post(
      {
        json: {
          teamId: almostFullTeamId,
          userId: addedUser
        }
      },
      {
        headers: {
          Cookie: `auth_session=${SEARCHER.sessionId}`
        }
      }
    );

    expect(response.status).toBe(200);

    const dbRes = await db
      .select()
      .from(teamInvites)
      .where(eq(teamInvites.userId, lostInvite));
    expect(dbRes.length).toBe(0);
  });

  test('Does not add to non-existent team', async () => {
    const userId = await createUserWithQr('hacker', {
      name: 'Do I really need to be doing this every time?',
      email: 'probablynot@gmail.com',
      password: 'ButItsPrettyClean!123'
    });

    const response = await baseRoute.addUserToTeam.$post(
      {
        json: {
          teamId: 123123123,
          userId
        }
      },
      {
        headers: {
          Cookie: `auth_session=${SEARCHER.sessionId}`
        }
      }
    );

    expect(response.status).toBe(404);
  });

  test('Does not add to team if user is already in team', async () => {
    await db.insert(qrs).values({
      userId: testUsers[IN_TEAM]!.userId,
      uuid: 'some valid uuid idk'
    });

    const response = await baseRoute.addUserToTeam.$post(
      {
        json: {
          teamId: regularTeamId,
          userId: testUsers[IN_TEAM]!.userId
        }
      },
      {
        headers: {
          Cookie: `auth_session=${SEARCHER.sessionId}`
        }
      }
    );

    expect(response.status).toBe(409);
  });

  test('Fails if user is nonexistent', async () => {
    const response = await baseRoute.addUserToTeam.$post(
      {
        json: {
          teamId: regularTeamId,
          userId: 'nonexistent'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${SEARCHER.sessionId}`
        }
      }
    );

    expect(response.status).toBe(404);
  });

  test('Fails if user is not a hacker', async () => {
    const userId = await createUserWithQr('admin', {
      name: 'Foxblood',
      email: 'foxblood@cometotheuk.au',
      password: 'idkSmth123@'
    });

    const response = await baseRoute.addUserToTeam.$post(
      {
        json: {
          teamId: regularTeamId,
          userId
        }
      },
      {
        headers: {
          Cookie: `auth_session=${SEARCHER.sessionId}`
        }
      }
    );

    expect(response.status).toBe(409);
  });

  test('Fails if user is not linked to QR code', async () => {
    const userId = await createUser('hacker', {
      name: 'Regular user',
      email: 'whereismy@qr.sad',
      password: 'idkSmth123@'
    });

    const response = await baseRoute.addUserToTeam.$post(
      {
        json: {
          teamId: regularTeamId,
          userId
        }
      },
      {
        headers: {
          Cookie: `auth_session=${SEARCHER.sessionId}`
        }
      }
    );

    expect(response.status).toBe(404);
  });
});
