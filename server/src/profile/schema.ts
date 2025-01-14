import { pgTable, text, boolean } from 'drizzle-orm/pg-core';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from '../auth/schema';
import { type Role } from '../types';
import { passwordPattern } from '../auth/types';

export const profiles = pgTable('profiles', {
  id: text('id')
    .notNull()
    .primaryKey()
    .references(() => users.id),
  photos_opt_out: boolean('photos_opt_out').notNull(),
  dietary_restrictions: text('dietary_restrictions').array().notNull(),
  allergies: text('allergies').array().notNull(),
  pronouns: text('pronouns'),
  meals: boolean('meals').array().default([false, false, false]).notNull()
});

const selectProfileSchema = createSelectSchema(profiles);

export const insertProfileSchema = selectProfileSchema
  .extend({ password: z.string().regex(passwordPattern) })
  .omit({ id: true, meals: true })
  .strict();

export const updateProfileSchema = selectProfileSchema
  .omit({ id: true, meals: true })
  .strict()
  .partial();

export type SelectedProfile = z.infer<typeof selectProfileSchema>;
export type Profile = {
  id: string;
  name: string;
  email: string;
  role: Role;
  photos_opt_out: boolean;
  dietary_restrictions: string[];
  allergies: string[];
  pronouns: string | null;
  meals: boolean[];
};

export const updateMealSchema = z
  .object({
    userId: z.string()
  })
  .strict();

// searchUser requires an email or a name
// there is a minimum length so the volunteer cannot essentially GET /all
export const searchUserSchema = z
  .object({
    email: z.string().min(5).optional(),
    name: z.string().min(3).optional()
  })
  .refine(({ email, name }) => email != undefined || name != undefined, {
    message: 'Please supply a name (min length 3) or an email (min length 5).'
  });
