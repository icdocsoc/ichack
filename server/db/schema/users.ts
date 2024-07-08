import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { boolean, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const userRoles = pgEnum('user_roles', [
  'admin',
  'hacker',
  'sponsor',
  'volunteer',
  'judge'
]);

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  role: userRoles('role').notNull(),
  photosOptOut: boolean('photos_opt_out').notNull().default(false),
  dietaryRestrictions: text('dietary_restrictions')
    .array()
    .notNull()
    .default([]),
  pronouns: text('pronouns').notNull(),
  meals: boolean('meals').array().notNull().default([false, false, false])
});

export const userSession = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp('expires_at', {
    withTimezone: true,
    mode: 'date'
  }).notNull()
});

export type UserInsertModel = InferInsertModel<typeof users>;
export type UserSelectModel = InferSelectModel<typeof users>;
