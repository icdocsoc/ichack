import { pgTable, text } from 'drizzle-orm/pg-core';

export const categories = pgTable('categories', {
  title: text('title').notNull().primaryKey(),
  owner: text('owner').notNull(),
  image: text('image').notNull(),
  shortDescription: text('short_description').notNull(),
  longDescription: text('long_description').notNull()
});
