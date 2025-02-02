import { parse } from 'csv-parse/sync';
import { eq } from 'drizzle-orm';
import { users } from '~~/server/src/auth/schema';
import { db } from '~~/server/src/drizzle';
import { teamMembers, teams } from '~~/server/src/team/schema';

const SPONSOR = 'category';
const WINNER_KEY = 'teamIDWinner';
const RUNNERUP_KEY = 'teamIDRunnerUp';

const path = prompt('File of csv relative to calling directory');
if (!path) {
  console.error('path is null');
  process.exit(1);
}

const content = await Bun.file(path).text();

const records: any[] = parse(content, { bom: true, trim: true, columns: true });

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

  console.log(`\tTeam name: ${winnerTeam.teamName}`);

  const winnerMembers = await db
    .select({
      userId: users.id,
      name: users.name,
      email: users.email
    })
    .from(teamMembers)
    .innerJoin(users, eq(users.id, teamMembers.userId))
    .where(eq(teamMembers.teamId, teamId));

  for (const member of winnerMembers) {
    console.log(`\t${member.name}`);
  }
};

for (const i in records) {
  const record = records[i];

  const sponsor = record[SPONSOR];
  const winner = record[WINNER_KEY];
  const runnerUp = record[RUNNERUP_KEY];

  console.log(`Category: ${sponsor}`);

  let winnerId: number;
  let runnerUpId: number;
  try {
    winnerId = parseInt(winner);
    runnerUpId = parseInt(runnerUp);
  } catch (e) {
    console.error('parsing team id went wrong');
    process.exit(1);
  }

  console.log('Winners:');
  await theOperation(winner);
  console.log('Runner ups:');
  await theOperation(runnerUp);
  console.log('\n');
}
