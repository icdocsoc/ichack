import { z } from 'zod';
import { db } from '../drizzle';
import factory from '../factory';
import { getProfileFromId } from '../profile';
import { profiles } from '../profile/schema';
import { grantAccessTo } from '../security';
import { simpleValidator } from '../validators';
import { qrSchema, qrs } from './schema';
import { eq } from 'drizzle-orm';

const qr = factory
  .createApp()
  .post(
    '/',
    grantAccessTo(['hacker'], { allowUnlinkedHackers: true }),
    simpleValidator('json', qrSchema),
    async ctx => {
      const { uuid } = ctx.req.valid('json');
      const userId = ctx.get('user')!.id; // we should be authneticated to use this

      const query = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, userId));
      if (query.length === 0)
        return ctx.text(
          'You have not registered yet. Please register first.',
          409
        );

      try {
        // all clear to insert qr code entry
        await db.insert(qrs).values({ userId, uuid });
        return ctx.text('', 201);
      } catch (e: any) {
        // If uuid is already in use, we will get a unique constraint error or primary key error
        return ctx.text(
          'QR code already linked to an account or user already linked to a QR code',
          409
        );
      }
    }
  )
  /**
   * An authenticated user can check if they have a qr code linked to their account
   * false -> 404 with message
   * true -> 200
   */
  .get(
    '/',
    grantAccessTo(['authenticated'], { allowUnlinkedHackers: true }),
    async ctx => {
      const user = ctx.get('user')!;

      const query = await db.select().from(qrs).where(eq(qrs.userId, user.id));

      if (query.length === 0) return ctx.text('UUID not found', 404);
      const userId = query[0]!.userId;

      const res = await getProfileFromId.execute({ id: userId });
      if (!res) return ctx.text('User profile not found', 404);
      return ctx.json({}, 200);
    }
  )
  .get(
    // volunteer+ can scan any qr code to get the profile + modify stuff
    '/:uuid',
    grantAccessTo(['volunteer', 'admin']),
    simpleValidator('param', qrSchema),
    async ctx => {
      const { uuid } = ctx.req.valid('param');
      const query = await db.select().from(qrs).where(eq(qrs.uuid, uuid));

      if (query.length === 0) return ctx.text('UUID not found', 404);
      const userId = query[0]!.userId;

      const res = await getProfileFromId.execute({ id: userId });
      if (!res) return ctx.text('User profile not found', 404);
      return ctx.json(res[0]!, 200);
    }
  )
  .delete(
    '/:id',
    grantAccessTo(['god']),
    simpleValidator('param', z.object({ id: z.string() })),
    async ctx => {
      const { id } = ctx.req.valid('param');
      const result = await db.delete(qrs).where(eq(qrs.userId, id)).returning();

      if (result.length === 0) return ctx.text('UUID not found', 404);
      return ctx.json({}, 200);
    }
  );

export default qr;
