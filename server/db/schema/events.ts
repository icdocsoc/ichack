import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const events = pgTable('events', {
  title: text('title').notNull().primaryKey(),
  description: text('description').notNull(),
  startsAt: timestamp('starts_at').notNull(),
  endsAt: timestamp('ends_at'),
  public: boolean('public').notNull()
});
