import factory from '../factory';
import { grantAccessTo } from '../security';
import { db } from '../drizzle';
import {
  events,
  createEventSchema,
  updateEventBody,
  createEventCheckInSchema,
  eventCheckIn
} from './schema';
import { and, asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { simpleValidator } from '../validators';
import { users } from '../auth/schema';
import { userHackspace } from '../hackspace/schema';

const event = factory
  .createApp()
  .get('/', grantAccessTo(['all']), async ctx => {
    const publicOnly = ctx.get('user') == null;

    if (publicOnly) {
      const publicEvents = await db
        .select()
        .from(events)
        .where(eq(events.public, true))
        .orderBy(asc(events.startsAt));
      return ctx.json(publicEvents, 200);
    }

    const allEvents = await db
      .select()
      .from(events)
      .orderBy(asc(events.startsAt));
    return ctx.json(allEvents, 200);
  })
  .get('/duckduckgoose', grantAccessTo(['all']), async ctx => {
    const message =
      process.env.DUCKDUCKGOOSE ??
      'Email ichack@ic.ac.uk asking for a duckduckgoose event.';
    return ctx.text(message, 200);
  })
  .post(
    '/',
    grantAccessTo(['admin']),
    simpleValidator('json', createEventSchema),
    async ctx => {
      const body = ctx.req.valid('json');
      const eventInDb = await db.insert(events).values(body).returning();

      return ctx.json(eventInDb[0]!.id, 201);
    }
  )
  .put(
    '/:id',
    grantAccessTo(['admin']),
    simpleValidator('json', updateEventBody),
    simpleValidator(
      'param',
      z.object({
        id: z.coerce.number()
      })
    ),
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
    simpleValidator(
      'param',
      z.object({
        id: z.coerce.number()
      })
    ),
    grantAccessTo(['admin']),
    async ctx => {
      const { id } = ctx.req.valid('param');
      const deleted = await db
        .delete(events)
        .where(eq(events.id, id))
        .returning();

      if (deleted.length == 0) return ctx.text('Event not found.', 404);

      return ctx.json({}, 200);
    }
  )
  .post(
    '/check-in',
    grantAccessTo(['volunteer', 'admin']),
    simpleValidator('json', createEventCheckInSchema),
    async ctx => {
      const body = ctx.req.valid('json');
      // check if user has already checked in
      const alreadyCheckedIn = await db
        .select()
        .from(eventCheckIn)
        .where(
          and(
            eq(eventCheckIn.eventId, body.eventId),
            eq(eventCheckIn.userId, body.userId)
          )
        );
      if (alreadyCheckedIn.length > 0)
        return ctx.text('Already checked in.', 400);
      // check both event and user exist
      const eventExists = await db
        .select({ id: events.id })
        .from(events)
        .where(eq(events.id, body.eventId));
      if (eventExists.length === 0)
        return ctx.text('Event does not exist.', 404);
      const userExists = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, body.userId));
      if (userExists.length === 0) return ctx.text('User does not exist.', 404);

      // Get hackspace
      const hackspaces = await db
        .select()
        .from(userHackspace)
        .where(eq(userHackspace.userId, body.userId));

      await db.transaction(async tx => {
        if (hackspaces.length === 1) {
          await tx
            .update(userHackspace)
            .set({
              points: hackspaces[0]!.points + 5
            })
            .where(eq(userHackspace.userId, body.userId));
        }

        await tx.insert(eventCheckIn).values(body);
      });

      return ctx.json(null, 201);
    }
  );
export default event;
