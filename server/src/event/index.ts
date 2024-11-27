import factory from '../factory';
import { grantAccessTo } from '../security';
import { db } from '../drizzle';
import { events, createEventBody, updateEventBody } from './schema';
import { eq } from 'drizzle-orm';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const validIdSchema = z.object({
  id: z.coerce.number()
});

const event = factory
  .createApp()
  .get('/', grantAccessTo('all'), async ctx => {
    const publicOnly = ctx.get('user') == null;

    if (publicOnly) {
      const publicEvents = await db
        .select()
        .from(events)
        .where(eq(events.public, true));
      return ctx.json(publicEvents, 200);
    }

    const allEvents = await db.select().from(events);
    return ctx.json(allEvents, 200);
  })
  .post(
    '/',
    grantAccessTo('admin'),
    zValidator('json', createEventBody, async (zRes, ctx) => {
      if (!zRes.success) {
        return ctx.text(
          `Invalid event JSON passed:\n${zRes.error.message}`,
          400
        );
      }
    }),
    async ctx => {
      const body = ctx.req.valid('json');
      const eventInDb = await db.insert(events).values(body).returning();

      return ctx.json(eventInDb[0]!.id, 201);
    }
  )
  .put(
    '/:id',
    grantAccessTo('admin'),
    zValidator('json', updateEventBody, async (zRes, ctx) => {
      if (!zRes.success) {
        return ctx.text('Invalid event JSON passed.', 400);
      }
    }),
    zValidator('param', validIdSchema, async (zRes, ctx) => {
      if (!zRes.success) {
        return ctx.text('Invalid ID', 400);
      }
    }),
    async ctx => {
      const body = ctx.req.valid('json');
      const { id } = ctx.req.valid('param');

      const currentEvent = await db
        .select()
        .from(events)
        .where(eq(events.id, id));
      if (currentEvent.length == 0)
        return ctx.text('Event does not exist.', 404);

      let startsAt = body.startsAt ?? currentEvent[0]!.startsAt;
      let endsAt = body.endsAt ?? currentEvent[0]!.endsAt;

      if (endsAt != null && startsAt > endsAt)
        return ctx.text('Event must start before it ends.', 400);

      await db.update(events).set(body).where(eq(events.id, id));

      return ctx.json({}, 201);
    }
  )
  .delete(
    '/:id',
    zValidator('param', validIdSchema, async (zRes, ctx) => {
      if (!zRes.success) {
        return ctx.text('Invalid ID', 400);
      }
    }),
    grantAccessTo('admin'),
    async ctx => {
      const { id } = ctx.req.valid('param');
      const deleted = await db
        .delete(events)
        .where(eq(events.id, id))
        .returning();

      if (deleted.length == 0) return ctx.text('Event not found.', 404);

      return ctx.json({}, 204);
    }
  );

export default event;
