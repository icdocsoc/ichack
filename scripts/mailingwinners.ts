import { parse } from 'csv-parse/sync';
import { eq } from 'drizzle-orm';
import { users } from '~~/server/src/auth/schema';
import { db } from '~~/server/src/drizzle';
import { teamMembers, teams } from '~~/server/src/team/schema';

const SPONSOR = 'category';
const WINNER_KEY = 'teamIDWinner';
const RUNNERUP_KEY = 'teamIDRunnerUp';

const SUBJECT = 'IMPORTANT: Update about IC Hack Submissions';

interface Output {
  subject: string; // IMPORTANT: Update about IC Hack Submissions
  to: string; // email
  name: string; // user's name
  userID: string; // user id

  // And also:
  teamName: string;
  teamPhones: string[];
}

const path = prompt('File of csv relative to calling directory?');
if (!path) {
  console.error('path is null');
  process.exit(1);
}

const theOperation = async (teamId: number) => {
  const output: Output[] = [];

  const winnerTeamQuery = await db
    .select({
      teamName: teams.teamName,
      phone: teams.phone,
      phone2: teams.phone2
    })
    .from(teams)
    .where(eq(teams.id, teamId));
  const winnerMembersQuery = await db
    .select({
      teamMember: teamMembers.userId
    })
    .from(teams)
    .innerJoin(teamMembers, eq(teams.id, teamMembers.teamId))
    .where(eq(teams.id, teamId));

  const winnerTeam = winnerTeamQuery[0]!;
  console.log('winnerTeam', winnerTeam);
  const winnerMemberIDs = winnerMembersQuery.map(e => e.teamMember);
  console.log('winnerMemberIDs', winnerMemberIDs);

  for (const memberId of winnerMemberIDs) {
    const userDetails = await db
      .select()
      .from(users)
      .where(eq(users.id, memberId));
    const member = userDetails[0]!;

    output.push({
      subject: SUBJECT,
      to: member.email,
      name: member.name,
      userID: member.id,
      teamName: winnerTeam.teamName,
      teamPhones: [winnerTeam.phone ?? '', winnerTeam.phone2 ?? '']
    });
  }

  // for (const member of winnerMembers) {
  //   output.push({
  //     subject: SUBJECT,
  //     to: member.email,
  //     name: member.name,
  //     userID: member.userId,
  //     teamName: winnerTeam.teamName,
  //     teamPhones: [winnerTeam.phone ?? '', winnerTeam.phone2 ?? '']
  //   });
  // }

  return output;
};

const content = await Bun.file(path).text();
const records: any[] = parse(content, { bom: true, trim: true, columns: true });
let finalOutput: Output[] = [];

for (const i in records) {
  const record = records[i];

  const sponsor = record[SPONSOR];
  const winner = record[WINNER_KEY];
  const runnerUp = record[RUNNERUP_KEY];

  let winnerId: number;
  let runnerUpId: number;
  try {
    winnerId = parseInt(winner);
    const winnerOutput = await theOperation(winner);
    finalOutput = [...finalOutput, ...winnerOutput];

    runnerUpId = parseInt(runnerUp);
    const runnerUpOutput = await theOperation(runnerUpId);
    finalOutput = [...finalOutput, ...runnerUpOutput];
  } catch (e) {}
}

const file = Bun.file('output.json');
file.write(JSON.stringify(finalOutput));
