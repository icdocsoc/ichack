import factory from '../factory';
import { grantAccessTo } from '../security';
import { db } from '../drizzle';
import { adminMeta, NO_MEAL } from './schema';
import { simpleValidator } from '../validators';
import { z } from 'zod';
import { count } from 'drizzle-orm';

const admin = factory
  .createApp()
  /**
   * There should only be one row in the admin table.
   * This check must be maintained by us, not postgres.
   */
  .use(async (c, next) => {
    const query = await db
      .select({
        count: count()
      })
      .from(adminMeta);
    const adminRows = query[0]!.count;

    if (adminRows < 1) {
      return c.text(
        'Something is horribly wrong, admin table has no rows',
        500
      );
    } else if (adminRows > 1) {
      return c.text(
        'Something is horribly wrong, admin table has multiple rows',
        500
      );
    }

    await next();
  })
  /**
   * Gets the meta data for the admin
   */
  .get('/', grantAccessTo('authenticated'), async c => {
    const query = await db.select().from(adminMeta);
    const meta = query[0]!;

    return c.json(meta, 200);
  })
  /**
   * This middleware guards the rest of the routes in this module.
   * Only admins and gods can access these routes.
   */
  .use(grantAccessTo('admin'))
  /**
   * A single endpoint to show the categories on the website
   */
  .put('/setCategories', async c => {
    await db.update(adminMeta).set({ showCategories: true });

    return c.body(null, 204);
  })
  /**
   * Update the meal number
   */
  .put(
    '/mealNumber',
    simpleValidator(
      'json',
      z.object({ mealNumber: z.coerce.number().min(NO_MEAL).max(2) }).strict()
    ),
    async c => {
      const { mealNumber } = c.req.valid('json');

      await db.update(adminMeta).set({ mealNumber });

      return c.body(null, 204);
    }
  );

export default admin;
