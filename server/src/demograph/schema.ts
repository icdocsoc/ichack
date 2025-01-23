import { pgTable, text, pgEnum, integer, serial } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

export const tShirtSizes = ['S', 'M', 'L', 'XL', '2XL'] as const;
export const genders = [
  'Male',
  'Female',
  'Non-binary',
  'Other',
  'N/A'
] as const;
export const yearsOfStudy = [
  'Undergraduate Year 1',
  'Undergraduate Year 2',
  'Undergraduate Year 3',
  'Undergraduate Year 4',
  'Undergraduate Year 5',
  'Undergraduate Year 6',
  'Graduated',
  'Postgraduate'
] as const;

export const sizesEnum = pgEnum('t_shirt_sizes', tShirtSizes);
export const genderTypes = pgEnum('gender_types', genders);
export const yearOfStudy = pgEnum('year_of_study', yearsOfStudy);

export const demograph = pgTable('demograph', {
  id: serial('id').primaryKey(),
  gender: genderTypes('gender'),
  university: text('university'),
  courseOfStudy: text('course_of_study'),
  yearOfStudy: yearOfStudy('year_of_study'),
  tShirtSize: sizesEnum('t_shirt_size').notNull(),
  age: integer('age')
});

export const newDemographSchema = createInsertSchema(demograph, {
  age: schema => schema.min(18).optional()
}).omit({ id: true });
