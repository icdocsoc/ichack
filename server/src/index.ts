import { Hono } from 'hono';
import logger from './logger';
import { testOrigin, validateOriginAndHost } from './security';
import { cors } from 'hono/cors';
import { csrf } from 'hono/csrf';
import sessionMiddleware from './auth/sessionMiddleware';
import { secureHeaders } from 'hono/secure-headers';
import auth from './auth';
import announcement from './announcement';
import category from './category';
import event from './event';
import profile from './profile';
import team from './team';

const app = new Hono()
  .use(logger())
  .use(secureHeaders())
  .use(
    cors({
      origin: (origin, _) =>
        testOrigin(origin) ? origin : 'http://example.org',
      credentials: true
    })
  )
  .use(
    csrf({
      origin: (origin, _) => testOrigin(origin)
    })
  )
  .use(validateOriginAndHost())
  .use(sessionMiddleware())
  .route('/announcement', announcement)
  .route('/auth', auth)
  .route('/category', category)
  .route('/event', event)
  .route('/profile', profile)
  .route('/team', team);

export default app;
