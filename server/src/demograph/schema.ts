import { pgTable, text, pgEnum, integer, serial } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

export const tShirtSizes = ['S', 'M', 'L', 'XL', '2XL'] as const;
export const genders = ['male', 'female', 'nb', 'other', 'na'] as const;

export const sizesEnum = pgEnum('t_shirt_sizes', tShirtSizes);
export const genderTypes = pgEnum('gender_types', genders);

export const demograph = pgTable('demograph', {
  id: serial('id').primaryKey(),
  courseOfStudy: text('course_of_study'),
  yearOfStudy: integer('year_of_study'),
  tShirtSize: sizesEnum('t_shirt_size'),
  age: integer('age'),
  gender: genderTypes('gender')
});

export const newDemographSchema = createInsertSchema(demograph, {
  age: schema => schema.min(18).optional(),
  yearOfStudy: schema => schema.positive().optional()
}).omit({ id: true });
