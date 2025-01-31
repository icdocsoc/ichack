import { pgTable, text, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

export const passes = pgTable('passes', {
  serialNumber: text('serial_number').primaryKey(),
  authenticationToken: text('authentication_token').notNull(),
  passTypeIdentifier: text('pass_type_identifier').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  backFields: text('back_fields').array().notNull().default([]),
  name: text('name').notNull(),
  role: text('role').notNull(),
  qrText: text('qr_text').notNull()
});

export const devices = pgTable('devices', {
  deviceLibraryIdentifier: text('device_library_identifier').primaryKey(),
  pushToken: text('push_token').notNull(),
  updatedAt: timestamp('updated_at').notNull()
});

export const registrations = pgTable(
  'registrations',
  {
    deviceLibraryIdentifier: text('device_library_identifier')
      .notNull()
      .references(() => devices.deviceLibraryIdentifier),
    serialNumber: text('serial_number')
      .notNull()
      .references(() => passes.serialNumber),
    updatedAt: timestamp('updated_at').notNull()
  },
  table => ({
    pk: primaryKey({
      columns: [table.deviceLibraryIdentifier, table.serialNumber]
    })
  })
);

export const insertPassSchema = createInsertSchema(passes);
export const insertDeviceSchema = createInsertSchema(devices);
export const insertRegistrationSchema = createInsertSchema(registrations);
