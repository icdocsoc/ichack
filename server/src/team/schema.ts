import {
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  boolean
} from 'drizzle-orm/pg-core';
import { categories } from '../category/schema';
import { users } from '../auth/schema';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// I believe this should cover every country and region code.
const phoneRegex = /\+[0-9]{7,15}/;

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  teamName: text('team_name').notNull(),
  sponsorCategory: text('sponsor_category').references(() => categories.slug),
  docsocCategory: text('docsoc_category').references(() => categories.slug),
  submissionLink: text('submission_link'),
  phone: text('phone'),
  phone2: text('phone2')
});

export const teamInvites = pgTable(
  'team_invites',
  {
    teamId: integer('team_id')
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

export const teamMembers = pgTable('team_members', {
  userId: text('user_id')
    .primaryKey()
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  isLeader: boolean('is_leader').notNull()
});

export const updateTeamSchema = createSelectSchema(teams)
  .extend({
    phone: z.string().regex(phoneRegex),
    phone2: z.string().regex(phoneRegex)
  })
  .omit({ id: true })
  .partial()
  .strict();

export const returnedTeamSchema = createSelectSchema(teams).extend({
  members: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      leader: z.boolean()
    })
  ),
  invited: z.array(
    z.object({
      id: z.string(),
      name: z.string()
    })
  )
});
