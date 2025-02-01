import { pgTable, text, boolean } from 'drizzle-orm/pg-core';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { selectUserSchema, users } from '../auth/schema';
import { passwordPattern } from '../auth/types';
import { newDemographSchema } from '../demograph/schema';
import { selectQrSchema } from '../qr/schema';
import { selectUserHackspaceSchema } from '../hackspace/schema';

export const profiles = pgTable('profiles', {
  id: text('id')
    .notNull()
    .primaryKey()
    .references(() => users.id),
  photos_opt_out: boolean('photos_opt_out').notNull(),
  dietary_restrictions: text('dietary_restrictions').array().notNull(),
  pronouns: text('pronouns'),
  meals: boolean('meals').array().default([false, false, false]).notNull(),
  cvUploaded: boolean('cv_uploaded').notNull(),
  discord_id: text('discord_id')
});

const selectProfileSchema = createSelectSchema(profiles);
export type RawProfile = z.infer<typeof selectProfileSchema>;

const userProfileSchema = z.intersection(
  z.intersection(selectProfileSchema, selectUserSchema),
  selectUserHackspaceSchema
);
export type UserAndProfile = z.infer<typeof userProfileSchema>;

const adminSelectProfileSchema = z.object({
  users: selectUserSchema,
  profiles: selectProfileSchema.nullable(),
  qr: selectQrSchema.nullable()
});
export type AdminSelectProfile = z.infer<typeof adminSelectProfileSchema>;

const insertProfileSchema = selectProfileSchema
  .extend({
    password: z
      .string()
      .regex(
        passwordPattern,
        'Passwords must be atleast 8 characters, one uppercase, one lowercase, and one digit.'
      )
  })
  .omit({ id: true, meals: true, cvUploaded: true, discord_id: true })
  .strict();

export const registerProfileSchema =
  insertProfileSchema.merge(newDemographSchema);

const stringToJson = z.string().transform((str, ctx) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Invalid JSON.'
    });
  }
});

export const registerProfilePostSchema = z.object({
  cv: z.instanceof(File).nullish(),
  registrationDetails: stringToJson.pipe(registerProfileSchema)
});

export const updateProfileSchema = selectProfileSchema
  .extend({
    cv: z.instanceof(File)
  })
  .omit({ id: true, meals: true, discord_id: true })
  .strict()
  .partial();

export const updateMealSchema = z
  .object({
    userId: z.string()
  })
  .strict();

export const deleteMealSchema = z
  .object({
    userId: z.string(),
    mealNum: z.coerce.number().int().lte(2).gte(0)
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
    message: 'Please supply a name (min length 3) or an email (min length 5).',
    path: ['name']
  });
