import {
  pgTable,
  serial,
  integer,
  primaryKey,
  text,
  pgEnum
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { hackspaces } from '../types';
import { z } from 'zod';
import { users } from '../auth/schema';

export const hackspaceEnum = pgEnum('hackspaces', hackspaces);

export const challenges = pgTable('challenges', {
  name: text('name').notNull().primaryKey(),
  qtr: integer('qtr').notNull().default(0),
  scr: integer('scr').notNull().default(0),
  jcr: integer('jcr').notNull().default(0)
});

export const userHackspace = pgTable('user_hackspace', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id),
  hackspace: hackspaceEnum('hackspace').notNull(),
  points: integer('points').notNull().default(0)
});

export const createChallenge = createInsertSchema(challenges);

/*
export const updateHackspace = selectProfileSchema
  .pick({
    id: true,
    hackspace: true
  })
  .transform(o => ({ userId: o.id, hackspace: o.hackspace }));
*/

export const deleteChallenge = z.object({ name: z.string() });
export const validateHackspace = z.object({ hackspace: z.enum(hackspaces) });

export const updateUserSchema = z.object({
  hackspace: z.enum(hackspaces).optional(),
  points: z.number().optional()
});
