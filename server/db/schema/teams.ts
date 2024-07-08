import { pgTable, serial, text } from 'drizzle-orm/pg-core';
import { categories } from './categories';
import { users } from './users';

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  teamName: text('team_name').notNull(),
  sponsorCategory: text('sponsor_category').references(() => categories.title),
  docsocCategory: text('docsoc_category').references(() => categories.title),
  invited: text('invited')
    .array()
    .notNull()
    .references(() => users.id)
    .default([]),
  members: text('members')
    .array()
    .notNull()
    .references(() => users.id)
    .default([]),
  leader: text('leader')
    .notNull()
    .references(() => users.id),
  phone: text('phone').notNull()
});
