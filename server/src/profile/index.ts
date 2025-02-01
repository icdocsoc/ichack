import factory from '../factory';
import { grantAccessTo } from '../security';
import { db } from '../drizzle';
import {
  updateMealSchema,
  updateProfileSchema,
  profiles,
  searchUserSchema,
  registerProfilePostSchema,
  deleteMealSchema
} from './schema';
import { count, eq, ilike, isNotNull, and, lt, sql } from 'drizzle-orm';
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
import { emailTemplate, icticket } from './assets/register';
import { qrs } from '../qr/schema';
import { adminMeta, NO_MEAL } from '../admin/schema';
import { userHackspace } from '../hackspace/schema';

nunjucks.configure({ autoescape: true });

const ONE_HOUR = 60 * 60;
const ONE_WEEK = 7 * 24 * 60 * 60;
const CON4_API_KEY = process.env.CON4_API_KEY!;

const statsQuery = db
  .select({
    all_users: count(users.id),
    registered_users: db.$count(
      users,
      and(eq(users.role, sql.placeholder('role')), isNotNull(users.password))
    )
  })
  .from(users)
  .where(eq(users.role, sql.placeholder('role')))
  .prepare('role');

const baseUrl = process.env.BASE_URL!;

export const getProfileFromId = db
  .select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    photos_opt_out: profiles.photos_opt_out,
    dietary_restrictions: profiles.dietary_restrictions,
    pronouns: profiles.pronouns,
    meals: profiles.meals,
    cvUploaded: profiles.cvUploaded,
    discord_id: profiles.discord_id,
    hackspace: userHackspace.hackspace
  })
  .from(profiles)
  .innerJoin(users, eq(users.id, profiles.id))
  .leftJoin(userHackspace, eq(users.id, userHackspace.userId))
  .where(eq(users.id, sql.placeholder('id')))
  .prepare('get_profile_from_id');

const profile = factory
  .createApp()
  .get(
    '/',
    grantAccessTo(['authenticated'], { allowUnlinkedHackers: true }),
    async ctx => {
      // Return logged in user

      // User is not null as this route required authentication
      const ctxUser = ctx.get('user')!;
      const user = await getProfileFromId.execute({ id: ctxUser.id });

      if (user.length < 1) {
        return ctx.text(
          'Your data does not exist. Have you completed registration yet?',
          404
        );
      }

      return ctx.json(user[0]!, 200);
    }
  )
  .get('/all', grantAccessTo(['admin']), async ctx => {
    const allUsers = await db
      .select()
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.id))
      .leftJoin(qrs, eq(qrs.userId, users.id));

    // returns type UserNullableProfile[]
    return ctx.json(allUsers, 200);
  })
  .get(
    '/search',
    grantAccessTo(['volunteer']),
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
          cvUploaded: profiles.cvUploaded,
          discord_id: profiles.discord_id,
          hackspace: userHackspace.hackspace
        })
        .from(profiles)
        .innerJoin(users, eq(users.id, profiles.id))
        .leftJoin(userHackspace, eq(users.id, userHackspace.userId))
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
    grantAccessTo(['authenticated'], { allowUnlinkedHackers: true }),
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
  .delete(
    '/cv',
    grantAccessTo(['authenticated'], { allowUnlinkedHackers: true }),
    async ctx => {
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
        return ctx.text(
          'Failed to delete CV. Are you sure the CV exists?',
          500
        );
      }
    }
  )
  .get(
    '/cv',
    grantAccessTo(['hacker'], { allowUnlinkedHackers: true }),
    async ctx => {
      // Hacker: Downloads CV that they uploaded
      const user = ctx.get('user')!;
      const file = s3client.file(user.id);

      const url = file.presign({ expiresIn: ONE_HOUR });

      return ctx.redirect(url);
    }
  )
  .get(
    '/subscribe',
    grantAccessTo(['authenticated'], { allowUnlinkedHackers: true }),
    async ctx => {
      // WS for profile details
    }
  )
  .get('/cv/all', grantAccessTo(['god']), async ctx => {
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        cvUploaded: profiles.cvUploaded
      })
      .from(users)
      .rightJoin(profiles, eq(users.id, profiles.id));

    let res = 'First Name, Last Name, Link to CV\n';
    for (const user of allUsers) {
      if (!user.cvUploaded) continue;
      const firstName = user.name!.split(' ')[0];
      const restOfName = user.name!.split(' ').slice(1).join(' ');
      const cvName = await getCvFileName(user.id!);
      const cvLink = s3client.file(cvName).presign({ expiresIn: ONE_WEEK });

      res += `${firstName},${restOfName},${cvLink}\n`;
    }

    return ctx.body(res, 200, {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="cvs.csv"'
    });
  })
  .put(
    '/',
    grantAccessTo(['authenticated'], { allowUnlinkedHackers: true }),
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
    grantAccessTo(['volunteer']),
    simpleValidator('json', updateMealSchema),
    async ctx => {
      // { userId: string, num: number }
      // Toggle meal number `num`
      const { userId } = ctx.req.valid('json');

      // check if user has already had meal
      const mealNumRes = await db
        .select({ mealNumber: adminMeta.mealNumber })
        .from(adminMeta);
      const mealNum = mealNumRes[0]!.mealNumber;
      if (mealNum == NO_MEAL) return ctx.text('No meal is being served.', 400);

      const user = await db
        .select({ meals: profiles.meals })
        .from(profiles)
        .where(eq(profiles.id, userId));
      if (user.length < 1) return ctx.text('User not found.', 404);
      if (user[0]!.meals[mealNum])
        return ctx.text('User has already had meal.', 400);
      // Postgres is 1 indexed :|
      const updatedMeals = await db.execute(sql`
        UPDATE profiles
        SET meals[${mealNum}] = true
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
  .delete(
    '/meal',
    grantAccessTo(['admin', 'god']),
    simpleValidator('json', deleteMealSchema),
    async ctx => {
      // This mealNum is 0-indexed, to be consistent with the PUT /profiles/meal
      const { userId, mealNum } = ctx.req.valid('json');

      // Postgres is 1 indexed!
      const updatedMeals = await db.execute(sql`
        UPDATE profiles
        SET meals[${mealNum + 1}] = false
        WHERE id = ${userId}`);

      if (updatedMeals.rowCount == null) {
        apiLogger.error(
          ctx,
          'DELETE /profile/meal',
          `User ${userId} does not exist in the database.`
        );
        return ctx.text(
          'Failed to unset user meals - user does not exist.',
          404
        );
      }

      return ctx.text('', 200);
    }
  )
  .get(
    '/discord',
    grantAccessTo(['authenticated'], { allowUnlinkedHackers: true }),
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

      const dbRes = await db
        .select({ name: users.name, role: users.role })
        .from(users)
        .where(eq(users.id, session.userId));

      const discordRole =
        dbRes[0]!.role === 'god' || dbRes[0]!.role === 'admin'
          ? 'volunteer'
          : dbRes[0]!.role;

      const result = await discordRepo.addUserToServer(
        dbRes[0]!.name,
        discordRole
      );
      if (result.isError()) {
        return ctx.text(result.error.message, 500);
      }

      if (result.value != 'already_present') {
        await db
          .update(profiles)
          .set({ discord_id: result.value! })
          .where(eq(profiles.id, session.userId));
        // TODO: Update hackspace role
      }

      // TODO: Add /profile
      return ctx.redirect(`${baseUrl}`);
    }
  )
  .get(
    '/discord/:id',
    grantAccessTo(['all']),
    simpleValidator(
      'param',
      z.object({
        id: z.string()
      })
    ),
    async ctx => {
      const auth = ctx.req.header('Authorization');
      if (auth == null || auth !== `${CON4_API_KEY}`) {
        return ctx.text('You do not have access to this route.', 403);
      }

      const discordId = ctx.req.param('id');

      const dbRes = await db
        .select({
          id: profiles.id,
          name: users.name,
          hackspace: sql<string>`'QTR'`
        })
        .from(profiles)
        .innerJoin(users, eq(users.id, profiles.id))
        .where(eq(profiles.discord_id, discordId));

      if (dbRes.length < 1) {
        return ctx.text('User not found.', 404);
      }

      return ctx.json(dbRes[0]!, 200);
    }
  )
  .delete(
    '/discord',
    grantAccessTo(['authenticated'], { allowUnlinkedHackers: true }),
    async ctx => {
      const user = ctx.get('user')!;

      const dbRes = await db
        .select({ discord_id: profiles.discord_id })
        .from(profiles)
        .where(eq(profiles.id, user.id));

      if (dbRes[0]!.discord_id != null) {
        await DiscordRepository.removeUser(dbRes[0]!.discord_id);
      }

      await db
        .update(profiles)
        .set({ discord_id: null })
        .where(eq(profiles.id, user.id));

      return ctx.text('', 200);
    }
  )
  .post(
    '/register',
    grantAccessTo(['all']),
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
      const emailText = `Hi ${user[0]!.name},\n Thank you for registering for https://my.ichack.org! We'll be in touch closer to the time with access to our Discord and more information about the hackathon itself.\n For any queries, please email ichack@ic.ac.uk.`;

      try {
        await sendEmail(
          user[0]!.email,
          'My ICHack Registration Confirmation',
          emailText,
          emailHtml,
          [
            {
              filename: 'ticket.png',
              cid: 'ichackticket',
              content: icticket,
              encoding: 'base64'
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
  .get('/register/stats', grantAccessTo(['admin']), async ctx => {
    const hackerStats = await statsQuery.execute({ role: 'hacker' });
    const volunteerStats = await statsQuery.execute({ role: 'volunteer' });
    const adminStats = await statsQuery.execute({ role: 'admin' });

    return ctx.json(
      {
        hacker: hackerStats[0]!,
        volunteer: volunteerStats[0]!,
        admin: adminStats[0]!
      },
      200
    );
  })
  .get('/:id', grantAccessTo(['volunteer']), async ctx => {
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
        cvUploaded: profiles.cvUploaded,
        discord_id: profiles.discord_id,
        hackspace: userHackspace.hackspace
      })
      .from(profiles)
      .innerJoin(users, eq(users.id, profiles.id))
      .leftJoin(userHackspace, eq(users.id, userHackspace.userId))
      .where(eq(users.id, userId));

    if (user.length != 1) {
      return ctx.text('User not found.', 404);
    }

    return ctx.json(user[0], 200);
  });

export default profile;
