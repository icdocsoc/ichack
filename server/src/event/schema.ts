import { boolean, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const events = pgTable('events', {
  id: serial('id').notNull().primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  startsAt: timestamp('starts_at').notNull(),
  endsAt: timestamp('ends_at'),
  public: boolean('public').notNull()
});

export const createEventBody = createInsertSchema(events, {
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date()
})
  .omit({ id: true })
  .strict()
  .refine(data => data.endsAt == undefined || data.startsAt < data.endsAt, {
    message: 'Event must start before it ends.'
  });

export const updateEventBody = createSelectSchema(events, {
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date()
})
  .partial()
  .strict()
  .omit({ id: true });
