import factory from '../factory';
import { grantAccessTo } from '../security';
import { announcements, insertAnnouncementSchema } from './schema';
import { db } from '../drizzle';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { simpleValidator } from '../validators';

const updateAnnouncementBody = insertAnnouncementSchema.partial();

const announcement = factory
  .createApp()
  /**
   * GET /all
   */
  .get('/all', grantAccessTo('authenticated'), c => c.text('', 418))
  /**
   * POST /
   * This endpoint creates a new announcement. Only admins can access this endpoint.
   * The announcement should contain a title, description, and optionally a pinUntil timestamp.
   */
  .post(
    '/',
    grantAccessTo('admin'),
    simpleValidator('json', insertAnnouncementSchema),
    async c => {
      const announcement = c.req.valid('json');
      const affectedRows = await db
        .insert(announcements)
        .values({
          ...announcement,
          createdAt: new Date()
        })
        .returning();

      if (affectedRows.length < 1) {
        return c.text('Failed to create announcement', 500);
      } else if (affectedRows.length > 1) {
        return c.text(
          'Created more rows than needed, please report this to the developer',
          500
        );
      }

      return c.json({ id: affectedRows[0]!.id }, 201);
    }
  )
  /**
   * PUT /:id
   * This endpoint updates an existing announcement. Only admins can access this endpoint.
   * Admins can update the title, description, and pinUntil timestamp of the announcement.
   */
  .put(
    '/:id',
    simpleValidator('param', z.object({ id: z.coerce.number().positive() })),
    simpleValidator('json', updateAnnouncementBody),
    grantAccessTo('admin'),
    async c => {
      const { id } = c.req.valid('param');

      const announcementInDb = await db
        .select()
        .from(announcements)
        .where(eq(announcements.id, id));

      if (announcementInDb.length < 1) {
        return c.text(`Announcement of id '${id}' not found`, 404);
      } else if (announcementInDb.length > 1) {
        return c.text(
          'More than one announcement found. Please report this to the developer',
          500
        );
      }

      const changedAnnouncement = c.req.valid('json');
      const affectedRows = await db
        .update(announcements)
        .set(changedAnnouncement)
        .where(eq(announcements.id, id))
        .returning();

      if (affectedRows.length < 1) {
        return c.text('Failed to update announcement', 500);
      } else if (affectedRows.length > 1) {
        return c.text(
          'Updated more rows than needed, please report this to the developer',
          500
        );
      }

      return c.json({}, 200);
    }
  )
  /**
   * DELETE /:id
   * This endpoint deletes an existing announcement. Only admins can access this endpoint.
   * Admins can delete an announcement by providing the announcement ID.
   */
  .delete(
    '/:id',
    simpleValidator('param', z.object({ id: z.coerce.number().positive() })),
    grantAccessTo('admin'),
    async c => {
      const { id } = c.req.valid('param');

      const affectedRows = await db
        .delete(announcements)
        .where(eq(announcements.id, id))
        .returning();

      if (affectedRows.length < 1) {
        return c.text(`Announcement of id '${id}' not found`, 404);
      } else if (affectedRows.length > 1) {
        return c.text(
          'More than one announcement found. Please report this to the developer',
          500
        );
      }

      return c.json({}, 200);
    }
  );

export default announcement;
