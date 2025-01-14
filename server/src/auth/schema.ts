import { pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { roles } from '../types';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { passwordPattern } from './types';

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
  email: schema => schema.email()
});
export const selectUserSchema = createSelectSchema(users).omit({
  password: true
});

export const postCreateBody = insertUserSchema.pick({
  name: true,
  email: true,
  role: true
});

export const postLoginBody = insertUserSchema
  .pick({
    email: true,
    password: true
  })
  .merge(z.object({ password: z.string().regex(passwordPattern) }));

export const postChangePasswordBody = z.object({
  oldPassword: z
    .string()
    .regex(passwordPattern, 'Your old password is too weak.'),
  newPassword: z
    .string()
    .regex(passwordPattern, 'Your new password is too weak.')
});

// This is the same as insertUserSchemea, but with all fields required.
export const postRegisterBody = insertUserSchema.pick({ password: true });

export const postResetPasswordBody = z.object({
  token: z.string(),
  password: z.string().regex(passwordPattern, 'Your password is too weak.')
});
