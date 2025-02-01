import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from '../auth/schema';

export const locations = [
  'HXLY', // huxley
  'JCR', // junior common room
  'SCR', // senior common room
  'QTR', // queen's tower rooms
  'QLWN', // queen's lawn
  'HBAR', // h-bar
  'ICME', // main entrance
  'GRHL', // great hall
  'SF', // sherfield foyer
  'HF', // huxley foyer
  'H308', // huxley room 308
  'H311', // huxley room 311
  'H340', // huxley room 340
  'CLR' // clore lecture theatre
] as const;
export const locationEnum = pgEnum('location_enum', locations);

export const events = pgTable('events', {
  id: serial('id').notNull().primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  startsAt: timestamp('starts_at').notNull(),
  endsAt: timestamp('ends_at'),
  public: boolean('public').notNull(),
  locations: locationEnum('locations').array().notNull()
});

export const eventCheckIn = pgTable(
  'event_check_in',
  {
    eventId: integer('event_id')
      .notNull()
      .references(() => events.id),
    userId: text('user_id')
      .notNull()
      .references(() => users.id)
  },
  table => [
    {
      pk: primaryKey({ columns: [table.eventId, table.userId] })
    }
  ]
);

export const createEventCheckInSchema = createInsertSchema(eventCheckIn);

export const createEventSchema = createInsertSchema(events, {
  title: schema => schema.nonempty(),
  description: schema => schema.nonempty(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date().optional()
})
  .omit({ id: true })
  .strict()
  .refine(data => data.endsAt == undefined || data.startsAt < data.endsAt, {
    message: 'Event must start before it ends.',
    path: ['endsAt']
  });

export const updateEventBody = createSelectSchema(events, {
  /* Issue described at https://github.com/drizzle-team/drizzle-orm/issues/3842 */
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date().optional()
})
  .partial()
  .strict()
  .omit({ id: true });

export const eventSchema = createSelectSchema(events, {
  startsAt: z.date(),
  endsAt: z.date().optional()
});
