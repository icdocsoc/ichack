import { pgTable, primaryKey, serial, text } from 'drizzle-orm/pg-core';
import { categories } from '../category/schema';
import { users } from '../auth/schema';

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  teamName: text('team_name').notNull(),
  sponsorCategory: text('sponsor_category').references(() => categories.title),
  docsocCategory: text('docsoc_category').references(() => categories.title),
  leader: text('leader')
    .notNull()
    .references(() => users.id),
  submissionLink: text('submission_link'),
  phone: text('phone').notNull(),
  phone2: text('phone2')
});

export const teamInvites = pgTable(
  'team_invites',
  {
    teamId: text('team_id')
      .notNull()
      .references(() => teams.id),
    userId: text('user_id')
      .notNull()
      .references(() => users.id)
  },
  table => ({
    pk: primaryKey({ columns: [table.teamId, table.userId] })
  })
);

export const userTeam = pgTable('user_team', {
  userId: text('user_id')
    .primaryKey()
    .notNull()
    .references(() => users.id),
  teamId: text('team_id')
    .notNull()
    .references(() => teams.id)
});
