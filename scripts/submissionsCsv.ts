import { categories } from '~~/server/src/category/schema';
import { db } from '~~/server/src/drizzle';
import { teams } from '~~/server/src/team/schema';

const categoryEntries = await db.select().from(categories);
const categoryTransform = categoryEntries.reduce(
  (acc, { slug, ...rest }) => {
    acc[slug] = rest;
    return acc;
  },
  {} as Record<
    string,
    {
      title: string;
      owner: string;
      image: string;
      shortDescription: string;
      longDescription: string;
    }
  >
);

const getTableNumber = (room: string | null, tableNumber: string | null) => {
  if (room == null || tableNumber == null) {
    return '';
  }

  if (
    tableNumber.startsWith('S') ||
    tableNumber.startsWith('Q') ||
    tableNumber.startsWith('J')
  ) {
    return tableNumber;
  }

  if (
    tableNumber.startsWith('s') ||
    tableNumber.startsWith('q') ||
    tableNumber.startsWith('j')
  ) {
    return tableNumber.toUpperCase();
  }

  // is this case sensitive?
  switch (room) {
    case 'jcr':
      return `J${tableNumber}`;
    case 'qtr':
      return `Q${tableNumber}`;
    case 'scr':
      return `S${tableNumber}`;
    default:
      return tableNumber;
  }
};

console.log(categoryTransform);

const allTeamQuery = await db.select().from(teams);
const result = allTeamQuery.flatMap(t => {
  const chosenCat = [];
  if (t.docsocCategory) {
    const details = categoryTransform[t.docsocCategory];
    if (!details) {
      console.error('DOCSOC CATEGORY', t.docsocCategory, 'SLUG NOT FOUND');
      process.exit(1);
    }

    chosenCat.push({
      sponsor: details!.owner,
      category: details!.title,
      room: t.hackspace,
      team: t.teamName,
      tableNumber: getTableNumber(t.hackspace, t.tableNumber),
      teamID: t.id,
      intersystems: t.intersystems
    });
  }
  if (t.sponsorCategory && t.sponsorCategory.length) {
    const details = categoryTransform[t.sponsorCategory];
    if (!details) {
      console.error('SPONSOR CATEGORY', t.sponsorCategory, 'SLUG NOT FOUND');
      process.exit(1);
    }

    chosenCat.push({
      sponsor: details!.owner,
      category: details!.title,
      room: t.hackspace,
      team: t.teamName,
      tableNumber: getTableNumber(t.hackspace, t.tableNumber),
      teamID: t.id,
      intersystems: t.intersystems
    });
  }
  return chosenCat;
});

const output = Bun.file('teams.csv');
const writer = output.writer();
const intersystemsFile = Bun.file('intersystems.csv');
const intersystemsWriter = intersystemsFile.writer();

writer.write('sponsor,category,room,team,tableNumber,teamID\n');
intersystemsWriter.write('sponsor,category,room,team,tableNumber,teamID\n');
result.forEach(r => {
  writer.write(
    `${r.sponsor},${r.category},${r.room},${r.team},${r.tableNumber},${r.teamID}\n`
  );

  if (r.intersystems)
    intersystemsWriter.write(
      `${r.sponsor},${r.category},${r.room},${r.team},${r.tableNumber},${r.teamID}\n`
    );
});

writer.end();
intersystemsWriter.end();
