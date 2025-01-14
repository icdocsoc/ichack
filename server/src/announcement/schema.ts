import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const announcements = pgTable('announcements', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at').notNull(),
  pinUntil: timestamp('pin_until')
});

export const insertAnnouncementSchema = createInsertSchema(announcements, {
  /* Issue described at https://github.com/drizzle-team/drizzle-orm/issues/3842 */
  createdAt: z.coerce.date(),
  pinUntil: z.coerce.date().optional()
})
  .omit({
    id: true,
    createdAt: true
  })
  .strict();
