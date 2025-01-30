import { text } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
import { users } from '../auth/schema';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const qrs = pgTable('qr', {
  userId: text('user_id')
    .notNull()
    .primaryKey()
    .references(() => users.id),
  uuid: text('uuid').unique().notNull()
});

export const qrSchema = createInsertSchema(qrs, {
  userId: schema => schema.nonempty(),
  uuid: schema => schema.uuid().nonempty()
})
  .pick({ uuid: true })
  .strict();

export const selectQrSchema = createSelectSchema(qrs, {
  uuid: schema => schema.uuid()
});
