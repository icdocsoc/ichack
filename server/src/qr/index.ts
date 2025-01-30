import { z } from 'zod';
import { db } from '../drizzle';
import factory from '../factory';
import { getProfileFromId } from '../profile';
import { grantAccessTo } from '../security';
import { simpleValidator } from '../validators';
import { qrSchema, qrs } from './schema';
import { eq } from 'drizzle-orm';

const qr = factory
  .createApp()
  .post(
    '/',
    grantAccessTo('hacker'),
    simpleValidator('json', qrSchema),
    async ctx => {
      const { uuid } = ctx.req.valid('json');
      const userId = ctx.get('user')!.id; // we should be authneticated to use this

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
  .get(
    // volunteer+ can scan any qr code to get the profile + modify stuff
    '/:uuid',
    grantAccessTo('volunteer', 'admin'),
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
    grantAccessTo('god'),
    simpleValidator('param', z.object({ id: z.string() })),
    async ctx => {
      const { id } = ctx.req.valid('param');
      const result = await db.delete(qrs).where(eq(qrs.userId, id)).returning();

      if (result.length === 0) return ctx.text('UUID not found', 404);
      return ctx.json({}, 200);
    }
  );

export default qr;
