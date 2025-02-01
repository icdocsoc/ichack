import factory from '../factory';
import { grantAccessTo } from '../security';
import { db } from '../drizzle';
import {
  createChallenge,
  challenges,
  deleteChallenge,
  validateHackspace,
  userHackspace,
  updateUserSchema
} from './schema';
import { eq, sum } from 'drizzle-orm';
import { simpleValidator } from '../validators';
import { z } from 'zod';
import { adminMeta } from '../admin/schema';
import { users } from '../auth/schema';

export const hackspace = factory
  .createApp()
  .post(
    '/',
    grantAccessTo(['hacker']),
    simpleValidator('json', validateHackspace),
    async ctx => {
      const { hackspace } = ctx.req.valid('json');
      const user = ctx.get('user')!;

      const res = await db
        .insert(userHackspace)
        .values({
          userId: user.id,
          hackspace: hackspace
        })
        .onConflictDoNothing()
        .returning();

      if (res.length == 0) {
        return ctx.body('You are already in a hackspace.', 409);
      }

      return ctx.body('', 201);
    }
  )
  .put(
    '/',
    grantAccessTo(['hacker']),
    simpleValidator('json', validateHackspace),
    async ctx => {
      const meta = await db.select().from(adminMeta);
      const mealNum = meta[0]!.mealNumber;

      const user = ctx.get('user')!;

      // You can no longer update your hackspace after dinner.
      if (mealNum >= 1) {
        return ctx.body('You can no longer change your hackspace.', 403);
      }

      const { hackspace } = ctx.req.valid('json');

      await db
        .insert(userHackspace)
        .values({
          userId: user.id,
          hackspace
        })
        .onConflictDoUpdate({
          target: userHackspace.userId,
          set: { hackspace }
        });

      return ctx.body('', 200);
    }
  )
  .post(
    '/challenge',
    grantAccessTo(['admin']),
    simpleValidator('json', createChallenge),
    async ctx => {
      const body = ctx.req.valid('json');
      const res = await db
        .insert(challenges)
        .values(body)
        .onConflictDoNothing()
        .returning();

      if (res.length == 0) return ctx.json({}, 409);

      return ctx.json({}, 201);
    }
  )
  .put(
    '/challenge',
    grantAccessTo(['admin']),
    simpleValidator('json', createChallenge),
    async ctx => {
      const body = ctx.req.valid('json');

      const res = await db
        .update(challenges)
        .set(body)
        .where(eq(challenges.name, body.name!))
        .returning();

      if (res.length == 0) return ctx.text('Challenge not found', 404);

      return ctx.text('', 201);
    }
  )
  .get('/challenges', grantAccessTo(['all']), async ctx => {
    const score = await db.select().from(challenges);

    return ctx.json(score, 200);
  })
  .get('/users', grantAccessTo(['admin']), async ctx => {
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        hackspace: userHackspace.hackspace,
        points: userHackspace.points
      })
      .from(userHackspace)
      .rightJoin(users, eq(userHackspace.userId, users.id));

    return ctx.json(allUsers, 200);
  })
  .put(
    '/users/:id',
    grantAccessTo(['admin']),
    simpleValidator('param', z.object({ id: z.string() })),
    simpleValidator('json', updateUserSchema),
    async ctx => {
      const { id } = ctx.req.valid('param');
      const body = ctx.req.valid('json');

      const user = await db.select().from(users).where(eq(users.id, id));
      if (!user.length) {
        return ctx.body('User does not exist.', 404);
      }

      const res = await db
        .update(userHackspace)
        .set({
          ...body
        })
        .where(eq(userHackspace.userId, id))
        .returning();

      // User does not have hackspace; add it.
      if (res.length == 0) {
        if (!body.hackspace)
          return ctx.body('User does not have a hackspace.', 404);

        await db
          .insert(userHackspace)
          .values({
            userId: id,
            hackspace: body.hackspace!,
            points: body.points
          })
          .returning();
      }

      return ctx.body('', 201);
    }
  )
  .get('/scores', grantAccessTo(['all']), async ctx => {
    const totalScores = {
      jcr: 0,
      scr: 0,
      qtr: 0
    };

    const challengeScores = await db.select().from(challenges);

    for (const score of challengeScores) {
      totalScores.qtr += score.qtr;
      totalScores.scr += score.scr;
      totalScores.jcr += score.jcr;
    }

    const userScores = await db
      .select({
        hackspace: userHackspace.hackspace,
        totalScore: sum(userHackspace.points)
      })
      .from(userHackspace)
      .groupBy(userHackspace.hackspace);

    for (const score of userScores) {
      totalScores[score.hackspace!] += +score.totalScore!;
    }

    return ctx.json(totalScores, 200);
  })
  .delete(
    '/challenge',
    grantAccessTo(['admin']),
    simpleValidator('json', deleteChallenge),
    async ctx => {
      const body = ctx.req.valid('json');
      const res = await db
        .delete(challenges)
        .where(eq(challenges.name, body.name))
        .returning();
      return ctx.json(res, 200);
    }
  )
  .post(
    '/:id',
    grantAccessTo(['volunteer']),
    simpleValidator('param', z.object({ id: z.string() })),
    simpleValidator('json', validateHackspace),
    async ctx => {
      const { id } = ctx.req.valid('param');
      const { hackspace } = ctx.req.valid('json');

      const userExists = await db.select().from(users).where(eq(users.id, id));
      if (!userExists.length) {
        return ctx.body('User does not exist.', 404);
      }

      const res = await db
        .insert(userHackspace)
        .values({
          userId: id,
          hackspace
        })
        .returning()
        .onConflictDoNothing();

      if (res.length == 0) {
        return ctx.body('User is already in a hackspace.', 409);
      }

      return ctx.body('', 201);
    }
  )
  .get(
    '/users/:id',
    grantAccessTo(['admin', 'volunteer']),
    simpleValidator(
      'param',
      z.object({
        id: z.string()
      })
    ),
    async ctx => {
      const { id } = ctx.req.valid('param');

      const user = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          hackspace: userHackspace.hackspace,
          points: userHackspace.points
        })
        .from(userHackspace)
        .rightJoin(users, eq(userHackspace.userId, users.id))
        .where(eq(users.id, id));

      if (user.length == 0) {
        return ctx.body('User does not exist.', 404);
      }

      return ctx.json(user[0]!, 200);
    }
  );
