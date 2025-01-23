import factory from '../factory';
import { grantAccessTo } from '../security';
import { db } from '../drizzle';
import {
  updateMealSchema,
  updateProfileSchema,
  profiles,
  searchUserSchema,
  registerProfilePostSchema
} from './schema';
import { eq, ilike, lt, sql } from 'drizzle-orm';
import { apiLogger } from '../logger';
import { users, userToken } from '../auth/schema';
import { z } from 'zod';
import { hash } from 'argon2';
import { hashOptions, lucia } from '../auth/lucia';
import { DiscordRepository } from './discord';
import { simpleValidator } from '../validators';
import { cvValidator, getCvFileName, s3client, uploadCv } from './cv';
import { demograph } from '../demograph/schema';
import { Result } from 'typescript-result';
import { sendEmail } from '../email';
import nunjucks from 'nunjucks';
import { emailTemplate } from './assets/register';

nunjucks.configure({ autoescape: true });

const ONE_HOUR = 60 * 60;

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
        pronouns: profiles.pronouns,
        meals: profiles.meals,
        cvUploaded: profiles.cvUploaded
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

    return ctx.json(user[0]!, 200);
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
    simpleValidator('query', searchUserSchema),
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
          pronouns: profiles.pronouns,
          meals: profiles.meals,
          cvUploaded: profiles.cvUploaded
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
  .post(
    '/cv',
    simpleValidator('form', cvValidator),
    grantAccessTo('authenticated'),
    async ctx => {
      const user = ctx.get('user')!;
      const { cv } = ctx.req.valid('form');

      const result = await uploadCv(ctx, cv, user.id);

      if (result.isError()) {
        return ctx.text(result.error.message, result.error.status);
      }

      return ctx.text('', 201);
    }
  )
  .delete('/cv', grantAccessTo('authenticated'), async ctx => {
    // Delete CV
    const user = ctx.get('user')!;
    const filename = await getCvFileName(user.id);
    const file = s3client.file(filename);

    try {
      await file.delete();
      return ctx.text('', 200);
    } catch (e: any) {
      apiLogger.error(
        ctx,
        'DELETE /profile/cv',
        'Failed to delete CV',
        e.message
      );
      return ctx.text('Failed to delete CV. Are you sure the CV exists?', 500);
    }
  })
  .get('/cv', grantAccessTo('hacker'), async ctx => {
    // Hacker: Downloads CV that they uploaded
    const user = ctx.get('user')!;
    const file = s3client.file(user.id);

    const url = file.presign({ expiresIn: ONE_HOUR });

    return ctx.redirect(url);
  })
  .get('/subscribe', grantAccessTo('authenticated'), async ctx => {
    // WS for profile details
  })
  .put(
    '/',
    grantAccessTo('authenticated'),
    simpleValidator('json', updateProfileSchema),
    async ctx => {
      // Update profile info w a partial user object
      try {
        const data = ctx.req.valid('json');
        const ctxUser = ctx.get('user')!;

        if (data.cv) {
          const result = await uploadCv(ctx, data.cv, ctxUser.id);
          if (result.isError()) {
            return ctx.text(result.error.message, result.error.status);
          }
          delete data.cv;
        }

        await db
          .update(profiles)
          .set(data)
          .where(eq(profiles.id, ctxUser.id))
          .returning();

        // No need to return anything, as the browser is subscribed to the websocket.
        return ctx.text('', 200);
      } catch (e: any) {
        apiLogger.error(
          ctx,
          'PUT /profile',
          'Failed to update user',
          e.message
        );
        return ctx.text('Internal error, failed to update profile', 500);
      }
    }
  )
  .put(
    '/meal',
    grantAccessTo('volunteer'),
    simpleValidator('json', updateMealSchema),
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
    simpleValidator(
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
        return ctx.text('User already in server.', 200);
      }
    }
  )
  .post(
    '/register',
    grantAccessTo('all'),
    simpleValidator('query', z.object({ token: z.string() })),
    simpleValidator('form', registerProfilePostSchema),
    async ctx => {
      const signedIn = ctx.get('user');
      if (signedIn != null) {
        return ctx.text('You have already registered.', 400);
      }

      const { token } = ctx.req.valid('query');
      const { cv, registrationDetails: body } = ctx.req.valid('form');

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
      const user = await db.select().from(users).where(eq(users.id, userId));

      const hashedPassword = await hash(body.password, hashOptions);

      const result = await db.transaction(async tx => {
        // Attempt to upload CV
        if (cv) {
          const result = await uploadCv(ctx, cv, userId);
          if (result.isError()) {
            return result;
          }
        }

        // meals is default false[3], so we don't explicitly state it here
        await tx.insert(profiles).values({
          id: userId,
          photos_opt_out: body.photos_opt_out,
          dietary_restrictions: body.dietary_restrictions,
          pronouns: body.pronouns,
          cvUploaded: cv != undefined
        });

        await tx.insert(demograph).values({
          gender: body.gender,
          university: body.university,
          courseOfStudy: body.courseOfStudy,
          yearOfStudy: body.yearOfStudy,
          tShirtSize: body.tShirtSize,
          age: body.age
        });

        // The simpleValidator schema takes care of the regex.
        await tx
          .update(users)
          .set({
            password: hashedPassword
          })
          .where(eq(users.id, userId));

        await tx.delete(userToken).where(eq(userToken.id, token));

        return Result.ok();
      });

      if (result.isError()) {
        return ctx.text(result.error.message, result.error.status);
      }

      const session = await lucia.createSession(userId, {});
      ctx.header(
        'Set-Cookie',
        lucia.createSessionCookie(session.id).serialize(),
        {
          append: true
        }
      );

      const emailHtml = nunjucks.renderString(emailTemplate, {
        name: user[0]!.name
      });
      const emailText = `Hi ${user[0]!.name},\ Thank you for registering for https://my.ichack.org! We'll be in touch closer to the time with access to our Discord and more information about the hackathon itself.\n For any queries, please email ichack@ic.ac.uk.`;

      try {
        await sendEmail(
          user[0]!.email,
          'My ICHack Registration Confirmation',
          emailText,
          emailHtml,
          [
            {
              file: 'ichack-ticket.png',
              cid: 'ichackticket',
              path: 'server/src/profile/assets/icticket.png'
            }
          ]
        );
      } catch (e: any) {
        apiLogger.error(
          ctx,
          'POST /profile/register',
          'Failed to send email',
          e.message
        );
      }

      return ctx.text('', 200);
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
        pronouns: profiles.pronouns,
        meals: profiles.meals,
        cvUploaded: profiles.cvUploaded
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
