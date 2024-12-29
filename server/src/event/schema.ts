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

export const createEventSchema = createInsertSchema(events, {
  title: schema => schema.title.nonempty(),
  description: schema => schema.description.nonempty(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date()
})
  .omit({ id: true })
  .strict()
  .refine(data => data.endsAt == undefined || data.startsAt < data.endsAt, {
    message: 'Event must start before it ends.',
    // Only show the error on the endsAt field (for now)
    // Issue detailed here: https://github.com/nuxt/ui/pull/2982
    path: ['endsAt']
  });

export const updateEventBody = createSelectSchema(events, {
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date()
})
  .partial()
  .strict()
  .omit({ id: true });

export const eventSchema = createSelectSchema(events, {
  startsAt: z.date(),
  endsAt: z.date()
});
