import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const announcements = pgTable('announcements', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at').notNull(),
  pinUntil: timestamp('pin_until')
});
