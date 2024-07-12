import type { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import { lucia } from './lucia';

export default () => async (c: Context, next: Next) => {
  const sessionId = getCookie(c, lucia.sessionCookieName) ?? null;
  if (!sessionId) {
    // No session cookie
    c.set('user', null);
    c.set('session', null);
    return next();
  }

  const { session, user } = await lucia.validateSession(sessionId);
  if (session && session.fresh) {
    c.header('Set-Cookie', lucia.createSessionCookie(session.id).serialize(), {
      append: true
    });
  }
  if (!session) {
    // This deletes the session cookie if it's invalid
    c.header('Set-Cookie', lucia.createBlankSessionCookie().serialize(), {
      append: true
    });
  }

  c.set('user', user);
  c.set('session', session);
  return next();
};
