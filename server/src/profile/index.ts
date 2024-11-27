import factory from '../factory';
import { grantAccessTo } from '../security';
import { db } from '../drizzle';
import {
  updateMealSchema,
  updateProfileSchema,
  profiles,
  insertProfileSchema,
  searchUserSchema
} from './schema';
import { and, eq, ilike, lt, sql } from 'drizzle-orm';
import { apiLogger } from '../logger';
import { zValidator } from '@hono/zod-validator';
import { users, userToken } from '../auth/schema';
import { z } from 'zod';
import { hash } from 'argon2';
import { hashOptions } from '../auth/lucia';
import { DiscordRepository } from './discord';

const tokenSchema = z.object({
  token: z.string()
});

const profile = factory
  .createApp()
  .get('/', grantAccessTo('authenticated'), async ctx => {
    // Return logged in user

    // User is not null as this route required authentication
    const ctxUser = ctx.get('user')!;
    const user = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        photos_opt_out: profiles.photos_opt_out,
        dietary_restrictions: profiles.dietary_restrictions,
        allergies: profiles.allergies,
        pronouns: profiles.pronouns,
        meals: profiles.meals
      })
      .from(profiles)
      .innerJoin(users, eq(users.id, profiles.id))
      .where(eq(users.id, ctxUser.id));

    if (user.length < 1) {
      return ctx.text(
        'Your data does not exist. Have you completed registration yet?',
        404
      );
    }

    return ctx.json(user[0], 200);
  })
  .get('/all', grantAccessTo('admin'), async ctx => {
    const allusers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        photos_opt_out: profiles.photos_opt_out,
        dietary_restrictions: profiles.dietary_restrictions,
        allergies: profiles.allergies,
        pronouns: profiles.pronouns,
        meals: profiles.meals
      })
      .from(profiles)
      .innerJoin(users, eq(users.id, profiles.id));

    return ctx.json(allusers, 200);
  })
  .get(
    '/search',
    grantAccessTo('volunteer'),
    zValidator('query', searchUserSchema, async (zRes, ctx) => {
      if (!zRes.success) {
        return ctx.text(zRes.error.message, 400);
      }
    }),
    async ctx => {
      const { name, email } = ctx.req.valid('query');
      // Can only search by name OR email; update Obsidian to note this.
      // Name takes precedence.
      const searchRes = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          photos_opt_out: profiles.photos_opt_out,
          dietary_restrictions: profiles.dietary_restrictions,
          allergies: profiles.allergies,
          pronouns: profiles.pronouns,
          meals: profiles.meals
        })
        .from(profiles)
        .innerJoin(users, eq(users.id, profiles.id))
        .where(
          name == undefined
            ? ilike(users.email, `${email}%`)
            : ilike(users.name, `${name}%`)
        );

      if (searchRes.length == 0) {
        return ctx.text('User not found.', 404);
      }

      return ctx.json(searchRes, 200);
    }
  )
  .post('/cv', grantAccessTo('hacker', 'volunteer'), async ctx => {
    // Uploads a CV to storage bucket
  })
  .get('/cv', grantAccessTo('hacker', 'sponsor'), async ctx => {
    // Hacker: Downloads CV that they uploaded
    // Sponsor: Downloads .zip of all CVs(?)
  })
  .get('/subscribe', grantAccessTo('authenticated'), async ctx => {
    // WS for profile details
  })
  .put(
    '/',
    grantAccessTo('authenticated'),
    zValidator('json', updateProfileSchema, async (zRes, ctx) => {
      if (!zRes.success) {
        return ctx.text(
          `Invalid JSON event passed in:\n${zRes.error.message}`,
          400
        );
      }
    }),
    async ctx => {
      // Update profile info w a partial user object
      try {
        const data = ctx.req.valid('json');
        const ctxUser = ctx.get('user')!;
        const updatedUser = await db
          .update(profiles)
          .set(data)
          .where(eq(profiles.id, ctxUser.id))
          .returning();

        if (updatedUser.length < 1) {
          throw new Error('Failed to update user.');
        }

        // No need to return anything, as the browser is subscribed to the websocket.
        return ctx.text('', 200);
      } catch (e) {
        apiLogger.error(ctx, 'PUT /profile', 'Failed to update user', e);
        return ctx.text('Internal error, failed to update profile', 500);
      }
    }
  )
  .put(
    '/meal',
    grantAccessTo('volunteer'),
    zValidator('json', updateMealSchema, async (zRes, ctx) => {
      if (!zRes.success) {
        return ctx.text(
          `Invalid JSON body supplied.\n${zRes.error.message}`,
          400
        );
      }
    }),
    async ctx => {
      // { userId: string, num: number }
      // Toggle meal number `num`
      const { userId } = ctx.req.valid('json');

      // TODO: replace with current meal number from db
      const mealNum = 0;

      // Postgres is 1 indexed :|
      const updatedMeals = await db.execute(sql`
        UPDATE profiles
        SET meals[${mealNum + 1}] = true
        WHERE id = ${userId}`);

      if (updatedMeals.rowCount == null) {
        apiLogger.error(
          ctx,
          'PUT /profile/meal',
          `User ${userId} does not exist in the database.`
        );
        return ctx.text(
          'Failed to update user meals - user does not exist.',
          404
        );
      }

      return ctx.text('', 200);
    }
  )
  .get(
    '/discord',
    grantAccessTo('authenticated'),
    zValidator(
      'query',
      z.object({ code: z.string().optional(), state: z.string().optional() })
    ),
    async ctx => {
      const { code, state } = ctx.req.valid('query');
      const session = ctx.get('session')!;

      // Add user to the Discord server
      // Must first make sure `state` matches some nonce - can use hash of current session cookie
      // See https://discord.com/developers/docs/topics/oauth2 for more details
      const discordRepo = new DiscordRepository(session.id, state, code);

      // Stage 1: No code & state
      // Generate state, redirect to Discord OAuth2 to get code.
      const hash = await discordRepo.initAndGetHash();
      if (hash == null) {
        apiLogger.error(
          ctx,
          'GET /profiles/discord',
          `Failed to create hash for user ${session.userId} with session ID ${session.id}`
        );
        return ctx.text('Failed to create OAuth2 link.', 500);
      }

      if (discordRepo.shouldRedirect()) {
        return ctx.redirect(discordRepo.redirectUrl());
      }

      // Stage 2: Code & state
      // Discord authorized, now double check that the state and hash match.
      // If so, add them to the server.
      if (!discordRepo.areStateAndCodeValid()) {
        // Logging as it could potentially be a malicious actor, although very doubt.
        apiLogger.error(
          ctx,
          'GET /profiles/discord',
          `Mismatched state for user ${session.userId}. Expected: '${hash}' but received: '${state}'`
        );
        return ctx.text('Invalid request.', 400);
      }

      const result = await discordRepo.addUserToServer();
      if (result.isError()) {
        return ctx.text(result.error.message, 500);
      }

      if (result.value == 'added') {
        return ctx.text('Successfully added user to the server.', 201);
      } else if (result.value == 'already_present') {
        return ctx.text('User already in server.', 204);
      }
    }
  )
  .get(
    '/register',
    grantAccessTo('all'),
    zValidator('query', tokenSchema, async (zRes, ctx) => {
      if (!zRes.success) {
        return ctx.text('Missing registration token.', 400);
      }
    }),
    async ctx => {
      const signedIn = ctx.get('user');
      if (signedIn != null) {
        return ctx.text('User is already registered.', 400);
      }

      const { token } = ctx.req.valid('query');

      const userAndToken = await db
        .select({
          name: users.name,
          email: users.email,
          role: users.role,
          expiresAt: userToken.expiresAt
        })
        .from(userToken)
        .leftJoin(users, eq(users.id, userToken.userId))
        .where(
          and(eq(userToken.id, token), eq(userToken.type, 'registration_link'))
        );
      if (userAndToken.length < 1) {
        return ctx.text('Invalid token.', 403);
      }
      const now = new Date();
      if (userAndToken[0]!.expiresAt < now) {
        await db.delete(userToken).where(lt(userToken.expiresAt, now));
        return ctx.text('Token is expired.', 403);
      }

      const user = userAndToken[0]!;

      return ctx.json(
        {
          name: user.name,
          email: user.email,
          role: user.role
        },
        200
      );
    }
  )
  .post(
    '/register',
    grantAccessTo('all'),
    zValidator('query', z.object({ token: z.string() }), async (zRes, ctx) => {
      if (!zRes.success) {
        return ctx.text('Missing registration token.', 400);
      }
    }),
    zValidator('json', insertProfileSchema, async (zRes, ctx) => {
      if (!zRes.success) {
        return ctx.text(`Invalid request:\n${zRes.error.message}`, 400);
      }
    }),
    async ctx => {
      const signedIn = ctx.get('user');
      if (signedIn != null) {
        return ctx.text('User is already registered.', 400);
      }

      const { token } = ctx.req.valid('query');
      const body = ctx.req.valid('json');

      const tokenInDb = await db
        .select()
        .from(userToken)
        .where(eq(userToken.id, token));
      if (tokenInDb.length < 1 || tokenInDb[0]!.type != 'registration_link') {
        return ctx.text('Invalid token.', 403);
      }
      const now = new Date();
      if (tokenInDb[0]!.expiresAt < now) {
        await db.delete(userToken).where(lt(userToken.expiresAt, now));
        return ctx.text('Token has expired.', 403);
      }

      const userId = tokenInDb[0]!.userId;
      const hashedPassword = await hash(body.password, hashOptions);

      await db.transaction(async tx => {
        await tx.delete(userToken).where(eq(userToken.id, token));

        // meals is default false[3], so we don't explicitly state it here
        await tx.insert(profiles).values({
          id: userId,
          photos_opt_out: body.photos_opt_out,
          dietary_restrictions: body.dietary_restrictions,
          allergies: body.allergies,
          pronouns: body.pronouns
        });

        // The zValidator schema takes care of the regex.
        await tx
          .update(users)
          .set({
            password: hashedPassword
          })
          .where(eq(users.id, userId));
      });

      // Do we want to generate a session now and sign them in,
      // or redirect them to the login after this? i.e. return session cookie or just OK
      // and let front end handle the rest.
      return ctx.text('', 204);
    }
  )
  .get('/:id', grantAccessTo('volunteer'), async ctx => {
    const userId = ctx.req.param('id');

    const user = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        photos_opt_out: profiles.photos_opt_out,
        dietary_restrictions: profiles.dietary_restrictions,
        allergies: profiles.allergies,
        pronouns: profiles.pronouns,
        meals: profiles.meals
      })
      .from(profiles)
      .innerJoin(users, eq(users.id, profiles.id))
      .where(eq(users.id, userId));

    if (user.length != 1) {
      return ctx.text('User not found.', 404);
    }

    return ctx.json(user[0], 200);
  });

export default profile;
