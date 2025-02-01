import { users, userSession } from '~~/server/src/auth/schema';
import { db } from '~~/server/src/drizzle';
import { profiles } from '~~/server/src/profile/schema';
import { qrs } from '~~/server/src/qr/schema';
import { teams, teamMembers, teamInvites } from '~~/server/src/team/schema';
import { tomorrow } from '~~/server/src/testHelpers';

const testUsers: { userId: string; sessionId: string }[] = [];

for (let i = 0; i < 700; i++) {
  // Ensure enough users for all teams, members, and invites
  testUsers.push({
    userId: `${i}userId`,
    sessionId: `${i}sessionId`
  });

  await db.insert(users).values({
    id: `${i}userId`,
    name: `User ${i}`,
    email: `user${i}@example.com`,
    role: 'hacker'
  });

  await db.insert(userSession).values({
    id: `${i}sessionId`,
    userId: `${i}userId`,
    expiresAt: tomorrow
  });
  await db.insert(profiles).values({
    id: `${i}userId`,
    dietary_restrictions: ['vegetarian'],
    pronouns: 'they/them',
    photos_opt_out: false,
    cvUploaded: false
  });

  await db.insert(qrs).values({
    userId: `${i}userId`,
    uuid: `qr${i}`
  });
}

for (let i = 0; i < 100; i++) {
  const newTeam = await db
    .insert(teams)
    .values({
      teamName: `Team ${i}`,
      submissionLink: `http://submission${i}.com`,
      phone: `+44712345${i.toString().padStart(4, '0')}`,
      phone2: `+44754321${i.toString().padStart(4, '0')}`
    })
    .returning();

  await db.insert(teamMembers).values([
    {
      teamId: newTeam[0].id,
      userId: testUsers[i * 7].userId, // Ensure unique users for each team
      isLeader: true
    },
    {
      teamId: newTeam[0].id,
      userId: testUsers[i * 7 + 1].userId,
      isLeader: false
    },
    {
      teamId: newTeam[0].id,
      userId: testUsers[i * 7 + 2].userId,
      isLeader: false
    },
    {
      teamId: newTeam[0].id,
      userId: testUsers[i * 7 + 3].userId,
      isLeader: false
    },
    {
      teamId: newTeam[0].id,
      userId: testUsers[i * 7 + 4].userId,
      isLeader: false
    }
  ]);

  await db.insert(teamInvites).values([
    {
      teamId: newTeam[0].id,
      userId: testUsers[i * 7 + 5].userId
    },
    {
      teamId: newTeam[0].id,
      userId: testUsers[i * 7 + 6].userId
    }
  ]);
}
