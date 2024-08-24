import { boolean, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { roles } from '../types';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const userRoles = pgEnum('user_roles', roles);

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  password: text('password'),
  role: userRoles('role').notNull(),
  photosOptOut: boolean('photos_opt_out').notNull().default(false),
  dietaryRestrictions: text('dietary_restrictions')
    .array()
    .notNull()
    .default([]),
  allergies: text('allergies').array().notNull().default([]),
  pronouns: text('pronouns'),
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

export const userToken = pgTable('token', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp('expires_at', {
    withTimezone: true,
    mode: 'date'
  }).notNull(),
  type: text('type').notNull() // TODO: Make an enum instead.
});

export const insertUserSchema = createInsertSchema(users, {
  email: schema => schema.email.email()
});
export const selectUserSchema = createSelectSchema(users);
