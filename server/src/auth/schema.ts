import { boolean, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { roles } from '../types';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const userRoles = pgEnum('user_roles', roles);
export const tokenType = pgEnum('token_type', [
  'forgot_password',
  'registration_link'
]);

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  // The reason why this is nullable is because gods create users without passwords.
  // And passwords are later filled in by the user.
  // Null Password means the user did not complete the registration process.
  password: text('password'),
  role: userRoles('role').notNull()
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
  type: tokenType('type').notNull()
});

export const insertUserSchema = createInsertSchema(users, {
  email: schema => schema.email.email()
});
export const selectUserSchema = createSelectSchema(users);
