import factory from '../factory';
import { grantAccessTo } from '../security';
import { announcements, createAnnouncementSchema } from './schema';
import { db } from '../drizzle';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { simpleValidator } from '../validators';
import { apiLogger } from '../logger';
import type { AnnouncementDetails } from '~~/shared/types';
import {
  sendDiscordMessage,
  updateDiscordMessage,
  deleteDiscordMessage
} from './discord';

const updateAnnouncementBody = createAnnouncementSchema.partial();

const announcement = factory
  .createApp()
  /**
   * GET /
   */
  .get('/', grantAccessTo(['authenticated']), async ctx => {
    const allAnnouncementsDb = await db.select().from(announcements);
    const allAnnouncements: AnnouncementDetails[] = allAnnouncementsDb.map(
      ({ messageId, ...rest }) => ({
        ...rest,
        synced: messageId != null
      })
    );
    return ctx.json(allAnnouncements, 200);
  })

  /**
   * POST /resync/:id
   * This endpoint makes sure that the discord webhook is synced
   * with the current state of the database. Only admins can access this
   * endpoint. The id should be of the announcement to sync.
   */
  .post(
    '/resync/:id',
    simpleValidator('param', z.object({ id: z.coerce.number().positive() })),
    grantAccessTo(['admin']),
    async c => {
      const { id } = c.req.valid('param');

      const ans = await db
        .select()
        .from(announcements)
        .where(eq(announcements.id, id));

      if (!ans || ans.length < 1) {
        return c.text(`Announcement of id '${id}' not found`, 404);
      } else if (ans.length > 1) {
        return c.text(
          'More than one announcement found. Please report this to the developer',
          500
        );
      }

      const announcement = ans[0]!;

      // Try discord message again
      const messageId = await sendDiscordMessage(announcement);
      if (!messageId) return c.json({ synced: false }, 200);

      // Update message id
      const changedAnnouncement = { ...announcement, messageId };
      const affectedRows = await db
        .update(announcements)
        .set(changedAnnouncement)
        .where(eq(announcements.id, id))
        .returning();

      if (!affectedRows || affectedRows.length < 1) {
        return c.text('Failed to update announcement', 500);
      } else if (affectedRows.length > 1) {
        return c.text(
          'Updated more rows than needed, please report this to the developer',
          500
        );
      }
      return c.json({ synced: true }, 200);
    }
  )

  /**
   * POST /
   * This endpoint creates a new announcement. Only admins can access this endpoint.
   * The announcement should contain a title, description, location
   * and optionally a pinUntil timestamp.
   */
  .post(
    '/',
    grantAccessTo(['admin']),
    simpleValidator('json', createAnnouncementSchema),
    async c => {
      const announcement = c.req.valid('json');
      let messageId: bigint | null = null;
      messageId = await sendDiscordMessage(announcement);
      if (messageId == null)
        apiLogger.error(c, 'Failed to send discord announcement!');

      // Update db
      const affectedRows = await db
        .insert(announcements)
        .values({
          ...announcement,
          created: new Date(),
          messageId: messageId
        })
        .returning();

      if (affectedRows.length < 1) {
        return c.text('Failed to add announcement to database', 500);
      } else if (affectedRows.length > 1) {
        return c.text(
          'Created more rows than needed, please report this to the developer',
          500
        );
      }

      return c.json(
        { id: affectedRows[0]!.id, synced: messageId != null },
        201
      );
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
    grantAccessTo(['admin']),
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

      if (!affectedRows || affectedRows.length < 1) {
        return c.text('Failed to update announcement', 500);
      } else if (affectedRows.length > 1) {
        return c.text(
          'Updated more rows than needed, please report this to the developer',
          500
        );
      }

      // Update on discord
      const announcement = affectedRows[0]!;
      if (announcement.messageId == null) return c.body('', 200);
      const synced = updateDiscordMessage({
        ...announcement,
        messageId: announcement.messageId!
      });
      return c.json({ synced }, 200);
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
    grantAccessTo(['admin']),
    async c => {
      const { id } = c.req.valid('param');

      const affectedRows = await db
        .delete(announcements)
        .where(eq(announcements.id, id))
        .returning();

      if (!affectedRows || affectedRows.length < 1) {
        return c.text(`Announcement of id '${id}' not found`, 404);
      } else if (affectedRows.length > 1) {
        return c.text(
          'More than one announcement found. Please report this to the developer',
          500
        );
      }

      // Delete discord message
      if (affectedRows[0]!.messageId == null) return c.body('', 200);
      const success = deleteDiscordMessage(affectedRows[0]!.messageId);

      return c.json({ synced: success }, 200);
    }
  );

export default announcement;
