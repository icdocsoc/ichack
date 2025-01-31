import { pgTable, text } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { users } from '../auth/schema';

export const companies = pgTable('companies', {
  name: text('name').notNull().primaryKey()
});

export const categories = pgTable('categories', {
  slug: text('slug').notNull().primaryKey(),
  title: text('title').notNull(),
  owner: text('owner')
    .notNull()
    .references(() => companies.name),
  image: text('image').notNull(),
  shortDescription: text('short_description').notNull(),
  longDescription:
    text(
      'long_description'
    ).notNull() /* This is being abandoned by Directors. Simply use shortDescription. */
});

export const sponsorCompany = pgTable('sponsor_company', {
  userId: text('user_id')
    .notNull()
    .primaryKey()
    .references(() => users.id),
  companyName: text('company_name')
    .notNull()
    .references(() => companies.name)
});

export const insertCategorySchema = createInsertSchema(categories, {
  image: schema => schema.url(),
  longDescription: schema => schema.url()
}); // The slug is generated from the owner and title

export const categorySchema = createSelectSchema(categories);
