import { boolean, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { roles } from '../types';

export const userRoles = pgEnum('user_roles', roles);

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
  allergies: text('allergies').array().notNull().default([]),
  pronouns: text('pronouns').notNull(),
  meals: boolean('meals').array().notNull().default([false, false, false]),
  state: text('state').notNull() // TODO: Make an enum instead.
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

export const sponsorCompany = pgTable('sponsor_company', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id),
  companyName: text('company_name').notNull()
});
