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

const path = prompt('File of csv relative to calling directory');
if (!path) {
  console.error('path is null');
  process.exit(1);
}

const content = await Bun.file(path).text();

const records: any[] = parse(content, { bom: true, trim: true, columns: true });

const output: Output[] = [];

const theOperation = async (teamId: number) => {
  const winnerTeamQuery = await db
    .select({
      teamName: teams.teamName,
      phone: teams.phone,
      phone2: teams.phone2
    })
    .from(teams)
    .where(eq(teams.id, teamId));

  const winnerTeam = winnerTeamQuery[0]!;

  const winnerMembers = await db
    .select({
      userId: users.id,
      name: users.name,
      email: users.email
    })
    .from(teamMembers)
    .innerJoin(users, eq(users.id, teamMembers.userId));

  for (const member of winnerMembers) {
    output.push({
      subject: SUBJECT,
      to: member.email,
      name: member.name,
      userID: member.userId,
      teamName: winnerTeam.teamName,
      teamPhones: [winnerTeam.phone ?? '', winnerTeam.phone2 ?? '']
    });
  }

  return output;
};

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
    runnerUpId = parseInt(runnerUp);
  } catch (e) {
    console.error('parsing team id went wrong');
    process.exit(1);
  }

  const output: Output[] = [
    ...(await theOperation(winner)),
    ...(await theOperation(runnerUp))
  ];
  finalOutput = {
    ...finalOutput,
    ...output
  };
}

console.log(finalOutput);
