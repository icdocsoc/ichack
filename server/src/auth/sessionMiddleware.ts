import { getCookie } from 'hono/cookie';
import { lucia } from './lucia';
import { apiLogger } from '../logger';
import factory from '../factory';

export default () =>
  factory.createMiddleware(async (c, next) => {
    const sessionId = getCookie(c, lucia.sessionCookieName) ?? null;
    if (!sessionId) {
      apiLogger.info(c, 'Session Middleware', 'No session cookie found');
      // No session cookie
      c.set('user', null);
      c.set('session', null);
      return next();
    }

    const { session, user } = await lucia.validateSession(sessionId);
    if (session && session.fresh) {
      apiLogger.info(
        c,
        'Session Middleware',
        `Valid session cookie; welcome ${user.email} (role: ${user.role})!`
      );
      c.header(
        'Set-Cookie',
        lucia.createSessionCookie(session.id).serialize(),
        {
          append: true
        }
      );
    }
    if (!session) {
      apiLogger.info(c, 'Session Middleware', 'Invalid session cookie');
      // This deletes the session cookie if it's invalid
      c.header('Set-Cookie', lucia.createBlankSessionCookie().serialize(), {
        append: true
      });
    }

    c.set('user', user);
    c.set('session', session);
    return next();
  });
