import { verifyRequestOrigin } from 'lucia';
import factory from './factory';
import type { AccessPermission, GrantAccessOptions } from './types';
import { db } from './drizzle';
import { users } from './auth/schema';
import { eq } from 'drizzle-orm';
import { profiles } from './profile/schema';
import { qrs } from './qr/schema';

/*
 * The following code is un-used.
 */
export const validateOriginAndHost = () =>
  factory.createMiddleware(async (c, next) => {
    if (c.req.method == 'GET')
      // Allow all GET requests
      return next();

    const originHeader = c.req.header('Origin') ?? null;
    const hostHeader = c.req.header('Host') ?? null;
    if (
      !originHeader ||
      !hostHeader ||
      !verifyRequestOrigin(originHeader, [hostHeader])
    )
      // Reject requests with invalid origin
      return c.body(null, 403);

    return next();
  });

export const testOrigin = (origin: string): boolean => {
  const prodRegex = /https:\/\/((my|www)\.)?ichack\.org/;
  const stagingRegex = /https:\/\/ichack-25-staging-\w+\.ondigitalocean\.app/;
  const stagingLanding = /https:\/\/isabella\.ichack\.pages\.dev/;
  return (
    process.env.NODE_ENV !== 'production' ||
    prodRegex.test(origin) ||
    stagingRegex.test(origin) ||
    stagingLanding.test(origin)
  );
};

/**
 * Security is VERY important when it comes to IC Hack APIs.
 * This middleware provides fine-grained access control system.
 * You can restrict access to a route based on the user's role.
 * At every route handler's definition, you call this middleware with the list of roles that can access the route.
 *
 * If the list of roles is empty, it means typescript has failed.
 * If the list of roles includes 'all', it means all users can access the route.
 * If the list of roles includes 'authenticated', then any authenticated user can access the route.
 * If the list of roles includes the user's role, then the user can access the route.
 * If the user's role is 'god', then the user can access the route. They have all permissions.
 * Otherwise the user is denied access to the route. A 403 status code is returned.
 *
 * @param roles who can access the route
 * @returns a middleware for granting access to the route
 */
export const grantAccessTo = (
  roles: [AccessPermission, ...AccessPermission[]],
  options?: GrantAccessOptions
) => {
  const allowUnlinkedHackers = options?.allowUnlinkedHackers ?? false;

  return factory.createMiddleware(async (c, next) => {
    if (!roles.length) {
      return c.text('Typescript failed to enforce required parameter', 500);
    }

    if (roles.includes('all')) {
      // Allow all users to access the route
      return await next();
    }

    const user = c.get('user');
    const session = c.get('session');
    if (user === null || session === null) {
      return c.text(
        `You do not have access to ${c.req.method} /api${c.req.path}`,
        403
      );
    }

    if (user.role === 'god')
      // Allow a god to access the route
      return await next();

    if (roles.includes('authenticated')) {
      // Allow an authenticated user or a god to access the route

      // But hackers must be registered if the option is unset
      if (user.role === 'hacker' && !allowUnlinkedHackers) {
        const query = await db
          .select()
          .from(users)
          .where(eq(users.id, user.id))
          .leftJoin(qrs, eq(users.id, qrs.userId));

        if (query.length !== 1) {
          return c.text(
            'Something has gone wrong. Please contact support with code ERR-1024',
            500
          );
        }

        const isRegistered = query[0]!.qr !== null;
        if (!isRegistered) {
          return c.text(
            'You must be registered to access this route. Have you linked your QR Code?',
            403
          );
        }
      }

      return await next();
    }

    // Restrict access to the route based on the user's role
    if (!roles.includes(user.role)) {
      return c.text(
        `You do not have access to ${c.req.method} /api${c.req.path}`,
        403
      );
    }

    if (user.role === 'hacker' && !allowUnlinkedHackers) {
      const query = await db
        .select()
        .from(users)
        .where(eq(users.id, user.id))
        .leftJoin(qrs, eq(users.id, qrs.userId));

      if (query.length !== 1) {
        return c.text(
          'Something has gone wrong. Please contact support with code ERR-1024',
          500
        );
      }

      const isRegistered = query[0]!.qr !== null;
      if (!isRegistered) {
        return c.text(
          'You must be registered to access this route. Have you linked your QR Code?',
          403
        );
      }
    }

    return await next();
  });
};
