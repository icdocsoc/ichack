import { pgTable, serial, text, timestamp, bigint } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const announcements = pgTable('announcements', {
  id: serial('id').notNull().primaryKey(),
  title: text('title').notNull(),
  location: text('location').notNull(),
  description: text('description').notNull(),
  created: timestamp('created_at').notNull().defaultNow(),
  pinUntil: timestamp('pin_until'),
  messageId: bigint('message_id', { mode: 'bigint' })
});

export const selectAnnouncementSchema = createInsertSchema(announcements, {
  /* Issue described at https://github.com/drizzle-team/drizzle-orm/issues/3842 */
  created: z.coerce.date(),
  pinUntil: z.coerce.date().nullable()
}).omit({
  messageId: true
});

export const createAnnouncementSchema = selectAnnouncementSchema
  .omit({
    id: true,
    created: true
  })
  .strict();
