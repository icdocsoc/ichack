import { verifyRequestOrigin } from 'lucia';
import factory from './factory';
import type { AccessPermission } from './types';

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
  const stagingRegex = /https:\/\/ichack-25-staging-\w+-.ondigitalocean.app/;
  const stagingLanding = /https:\/\/isabella.ichack.pages.dev/;
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
  ...roles: [AccessPermission, ...AccessPermission[]]
) =>
  factory.createMiddleware(async (c, next) => {
    if (!roles.length) {
      return c.text('Typescript failed to enforce required parameter', 500);
    }

    if (roles.includes('all')) {
      // Allow all users to access the route
      return next();
    }

    const user = c.get('user');
    const session = c.get('session');
    if (user === null || session === null) {
      return c.text(
        `You do not have access to ${c.req.method} /api${c.req.path}`,
        403
      );
    }

    if (roles.includes('authenticated') || user.role === 'god') {
      // Allow an authenticated user or a god to access the route
      return next();
    }

    // Restrict access to the route based on the user's role
    if (!roles.includes(user.role)) {
      return c.text(
        `You do not have access to ${c.req.method} /api${c.req.path}`,
        403
      );
    }

    return next();
  });
