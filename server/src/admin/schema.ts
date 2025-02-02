import { boolean, integer, pgTable } from 'drizzle-orm/pg-core';
import { createSelectSchema } from 'drizzle-zod';

export const NO_MEAL = -1;

export const adminMeta = pgTable('admin', {
  showCategories: boolean('show_categories').notNull().default(false),
  /**
   * The number of the meal that is currently being served.
   * If -1, no meal is being served.
   * If 0, Saturday lunch is being served.
   * If 1, Saturday dinner is being served.
   * If 2, Sunday breakfast is being served.
   */
  mealNumber: integer('meal_number').notNull().default(NO_MEAL),
  allowSubmissions: boolean('allow_submissions').notNull().default(true)
});

export const metadataSchema = createSelectSchema(adminMeta);
