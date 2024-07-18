import type { Context, Next } from 'hono';
import type { AccessPermission } from './types';
import type { User } from 'lucia';
import { apiLogger } from './logger';

export default (...roles: [AccessPermission, ...AccessPermission[]]) => {
  return async (c: Context, next: Next) => {
    if (!roles.length) {
      apiLogger.error(
        c,
        'Validate Access',
        'Typescript failed to enforce required parameter'
      );
      return c.text('Typescript failed to enforce required parameter', 500);
    }

    const user: User | null = c.get('user');
    if (user == null) {
      apiLogger.error(
        c,
        'Validate Access',
        'Unauthenticated user attemped to access route'
      );
      return c.text(
        `You must be logged in to access ${c.req.method} ${c.req.path}`,
        403
      );
    }

    if (roles.includes('authenticated') || user.role === 'god') {
      // Allow an authenticated user or a god to access the route
      return next();
    }

    // Restrict access to the route based on the user's role
    if (!roles.includes(user.role)) {
      apiLogger.error(
        c,
        'Validate Access',
        `${user.email} of role ${user.role} attemped to access route`
      );
      return c.text(
        `You're a ${user.role} and do not have access to ${c.req.method} ${c.req.path}`,
        403
      );
    }

    return next();
  };
};
