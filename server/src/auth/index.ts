import {
  postChangePasswordBody,
  postCreateBody,
  postLoginBody,
  postResetPasswordBody,
  users,
  userSession,
  userToken
} from './schema';
import { db } from '../drizzle';
import { generateIdFromEntropySize } from 'lucia';
import { and, eq, isNotNull, lt } from 'drizzle-orm';
import { getDummyPassword, hashOptions, lucia } from './lucia';
import { hash, verify } from 'argon2';
import factory from '../factory';
import { grantAccessTo } from '../security';
import { z } from 'zod';
import { simpleValidator } from '../validators';
import { HTTPException } from 'hono/http-exception';

const auth = factory
  .createApp()
  .post(
    '/create',
    grantAccessTo('god'),
    simpleValidator('json', postCreateBody),
    async c => {
      const userBody = c.req.valid('json');

      // Postgres asserts that email is unique.
      // Additionally, gods are the one making users, so they should know what they're doing.
      try {
        const uid = generateIdFromEntropySize(16);
        const userInDb = await db
          .insert(users)
          .values({
            ...userBody,
            id: uid
          })
          .returning();

        if (userInDb.length < 1) {
          throw new Error();
        }

        // Now asserted userInDb.length === 1
        const registration_token = generateIdFromEntropySize(16);
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 3); // 3 days from now

        await db.insert(userToken).values({
          id: registration_token,
          userId: uid,
          expiresAt: expiry,
          type: 'registration_link'
        });

        return c.json(
          { registration_token: registration_token, user_id: uid },
          201
        );
      } catch (e) {
        // User with email already exists
        throw new HTTPException(409, { message: (e as Error).message });
      }
    }
  )
  .post(
    '/login',
    grantAccessTo('all'), // Effectively a no-op - just being explicit
    simpleValidator('json', postLoginBody),
    async c => {
      if (c.get('session')) return c.text('You are already logged in', 409);

      const rejectionMessage =
        'Invalid email or password. Have you completed the sign up process?';

      const { email, password } = c.req.valid('json');

      const userQuery = await db
        .select()
        .from(users)
        .where(and(eq(users.email, email), isNotNull(users.password)));
      // email is unique, so only 1 user can be found.
      if (!userQuery || !userQuery.length) {
        // the user was not found.
        // hash a dummy password to prevent login throttling attacks.
        const dummyPassword = await getDummyPassword();
        await verify(dummyPassword, password, hashOptions);
        return c.text(rejectionMessage, 401);
      }

      // Now we know the user exists with non-null password.
      const user = userQuery[0]!;
      const userPassword = user.password!;

      // The user has a password, so we can verify it.
      const passwordMatch = await verify(userPassword, password, hashOptions);
      if (!passwordMatch) {
        return c.text(rejectionMessage, 401);
      }

      // The user has successfully logged in.
      // Create their session cookie
      const session = await lucia.createSession(user.id, {});
      c.header(
        'Set-Cookie',
        lucia.createSessionCookie(session.id).serialize(),
        {
          append: true
        }
      );
      return c.json(
        {
          id: user.id,
          name: user.name, // not sending the password back!
          email: user.email,
          role: user.role
        },
        200
      );
    }
  )
  .post('/logout', grantAccessTo('authenticated'), async c => {
    const session = c.get('session')!; // Session is non-null because of grantAccessTo('authenticated')

    await lucia.invalidateSession(session.id);
    c.header('Set-Cookie', lucia.createBlankSessionCookie().serialize(), {
      append: true
    });
    return c.body(null, 204);
  })
  .delete(
    '/:id',
    grantAccessTo('god'),
    simpleValidator('param', z.object({ id: z.string() })),
    async c => {
      const { id } = c.req.valid('param');
      const session = c.get('session')!; // Non-null because of grantAccessTo('god')

      if (session.userId === id)
        return c.text("You can't delete yourself", 400);

      const exists = await db.select().from(users).where(eq(users.id, id));
      if (!exists || !exists.length) {
        return c.text(`User with id '${id}' does not exist`, 404);
      }

      await db.transaction(async tx => {
        await tx
          .delete(userSession)
          .where(eq(userSession.userId, id)) // the session exists, that's how we got here.
          .returning();

        await tx.delete(userToken).where(eq(userToken.userId, id)).returning();

        // TODO delete profile table

        try {
          await tx.delete(users).where(eq(users.id, id)).returning();
        } catch (e) {
          // When other tables have a foreign key constraint on users
          return c.text('Failed to delete user', 422);
        }
      });

      return c.json({}, 200);
    }
  )
  .post(
    '/resetPassword',
    grantAccessTo('all'),
    simpleValidator('json', postResetPasswordBody),
    async c => {
      const session = c.get('session')!;
      if (session) {
        // Dude, you're already logged in.
        return c.text('You cannot reset your password', 403);
      }

      const { token, password } = c.req.valid('json');

      const tokenQuery = await db
        .select()
        .from(userToken)
        .where(
          and(eq(userToken.id, token), eq(userToken.type, 'forgot_password'))
        );
      // userToken.id is a primary key. It is unique.

      if (!tokenQuery || tokenQuery.length < 1) {
        return c.text('An invalid token was provided', 401);
      }

      const tokenResult = tokenQuery[0]!;
      const now = new Date();
      if (tokenResult.expiresAt < now) {
        await db.delete(userToken).where(lt(userToken.expiresAt, now));
        return c.text('An expired token was provided', 401);
      }

      const hashedPassword = await hash(password, hashOptions);

      await db.transaction(async tx => {
        await tx.delete(userToken).where(eq(userToken.id, token));
        await tx
          .update(users)
          .set({
            password: hashedPassword
          })
          .where(eq(users.id, tokenResult.userId));
      });

      return c.json({}, 200);
    }
  )
  .put(
    '/changePassword',
    grantAccessTo('authenticated'),
    simpleValidator('json', postChangePasswordBody),
    async c => {
      const user = c.get('user')!; // Non-null because of grantAccessTo('authenticated')

      const { oldPassword, newPassword } = c.req.valid('json');
      if (oldPassword === newPassword) {
        return c.text(
          "The new password can't be the same as the old password",
          400
        );
      }

      const hashedPassword = await hash(newPassword, hashOptions);

      const usersInDb = await db
        .select({ password: users.password })
        .from(users)
        .where(eq(users.id, user.id)); // user ID is unique
      if (!usersInDb || !usersInDb.length) {
        return c.text(`User of id ${user.id} not found`, 404);
      }

      const currPassword = usersInDb[0]!.password;
      if (!currPassword) {
        // The user was created by a god, but has no password.
        // The user is attempting to set their password for the first time.
        return c.text('You cannot change your password', 400);
      }

      const passwordMatch = await verify(
        currPassword,
        oldPassword,
        hashOptions
      );
      if (!passwordMatch)
        return c.text("The current password doesn't match", 401);

      await db.transaction(async tx => {
        await tx
          .update(users)
          .set({ password: hashedPassword })
          .where(eq(users.id, user.id));

        // delete all their sessions
        await tx.delete(userSession).where(eq(userSession.userId, user.id));
      });

      return c.json({}, 200);
    }
  )
  .get(
    '/register',
    grantAccessTo('all'),
    simpleValidator('query', z.object({ token: z.string() })),
    async c => {
      const signedIn = c.get('user');
      if (signedIn) {
        return c.text('You have already registered.', 400);
      }

      const { token } = c.req.valid('query');

      const tokenQuery = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          expiresAt: userToken.expiresAt
        })
        .from(users)
        .innerJoin(userToken, eq(userToken.userId, users.id))
        .where(
          and(eq(userToken.id, token), eq(userToken.type, 'registration_link'))
        );

      if (!tokenQuery || !tokenQuery.length)
        return c.text('Token not found', 404);

      const tokenResult = tokenQuery[0]!;
      const now = new Date();
      if (tokenResult.expiresAt < now) {
        await db.delete(userToken).where(lt(userToken.expiresAt, now));
        return c.text('Token not found', 404);
      }

      return c.json(
        {
          name: tokenResult.name,
          email: tokenResult.email,
          role: tokenResult.role
        },
        200
      );
    }
  );

export default auth;
