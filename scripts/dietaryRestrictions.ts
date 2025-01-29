import { eq, isNotNull, not } from 'drizzle-orm';
import { users } from './server/src/auth/schema';
import { db } from './server/src/drizzle';
import { profiles } from './server/src/profile/schema';

const output = Bun.file('dietaryRestrictions.csv');
const writer = output.writer();

writer.write('name,dietary_restrictions\n');

const res = await db
  .select({
    name: users.name,
    dietary_restrictions: profiles.dietary_restrictions
  })
  .from(users)
  .innerJoin(profiles, eq(users.id, profiles.id));

for (const person of res) {
  const res =
    person.dietary_restrictions.length == 0
      ? 'None'
      : person.dietary_restrictions.join(';');
  writer.write(`${person.name},${res}\n`);
}

await writer.end();
