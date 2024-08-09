import { insertUserSchema, users } from './schema';
import { zValidator } from '@hono/zod-validator';
import { db } from '../drizzle';
import { generateIdFromEntropySize } from 'lucia';
import { eq } from 'drizzle-orm';
import { getDummyPassword, hashOptions, lucia } from './lucia';
import { verify } from 'argon2';
import factory from '../factory';
import { grantAccessTo } from '../security';
import { z } from 'zod';

export const postAuthCreateBody = insertUserSchema.pick({
  name: true,
  email: true,
  role: true
});
export const postAuthLoginBody = insertUserSchema
  .pick({
    email: true,
    password: true
  })
  .extend({
    password: z.string()
  });

const auth = factory
  .createApp()
  .post(
    '/create',
    grantAccessTo('god'),
    zValidator('json', postAuthCreateBody, ({ success }, c) => {
      if (!success) {
        return c.text('Name, email and role are required', 400);
      }
    }),
    async c => {
      const userBody = c.req.valid('json');

      try {
        const userInDb = await db
          .insert(users)
          .values({
            ...userBody,
            id: generateIdFromEntropySize(16)
          })
          .returning();

        if (userInDb.length < 1) {
          return c.text('Failed to create user', 409);
        } else if (userInDb.length > 1) {
          return c.text(
            'More users were changed than required. Please report this to the developer.',
            500
          );
        }

        // Now asserted userInDb.length === 1
        return c.json(
          {
            id: userInDb[0].id,
            name: userInDb[0].name,
            role: userInDb[0].role
          },
          201
        );
      } catch (e) {
        return c.text('Failed to create user', 409);
      }
    }
  )
  .post(
    '/login',
    grantAccessTo('all'), // Effectively a no-op - just being explicit
    zValidator('json', postAuthLoginBody, ({ success }, c) => {
      if (!success) {
        return c.text('Email and password are required', 400);
      }
    }),
    async c => {
      const rejectionMessage =
        'Invalid email or password. Have you completed the sign up process?';

      const { email, password } = c.req.valid('json');

      const userQuery = await db
        .select()
        .from(users)
        .where(eq(users.email, email));
      if (!userQuery || !userQuery.length) {
        // the user was not found.
        // hash a dummy password to prevent login throttling attacks.
        const dummyPassword = await getDummyPassword();
        await verify(dummyPassword, password, hashOptions);
        return c.text(rejectionMessage, 401);
      }

      // Now we know the user exists,
      const user = userQuery[0];
      const userPassword = user.password;
      if (userPassword === null) {
        // The user was created by a god, but has no password.
        // i.e. the user is attempting to login without signing up.
        // hash a dummy password to prevent login throttling attacks.
        const dummyPassword = await getDummyPassword();
        await verify(dummyPassword, password, hashOptions);
        return c.text(rejectionMessage, 401);
      }

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
          name: user.name,
          role: user.role
        },
        200
      );
    }
  )
  .post('/logout', grantAccessTo('authenticated'), async c => {
    const session = c.get('session');

    await lucia.invalidateSession(session!.id); // Session is non-null because of grantAccessTo('authenticated')
    c.header('Set-Cookie', lucia.createBlankSessionCookie().serialize(), {
      append: true
    });
    return c.json({}, 204);
  });

export default auth;
