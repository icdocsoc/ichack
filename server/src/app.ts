import logger from './logger';
import sessionMiddleware from './auth/sessionMiddleware';
import auth from './auth';
import announcement from './announcement';
import category from './category';
import event from './event';
import profile from './profile';
import team from './team';
import factory from './factory';
import { HTTPException } from 'hono/http-exception';

const api = factory
  .createApp()
  .route('/announcement', announcement)
  .route('/auth', auth)
  .route('/category', category)
  .route('/event', event)
  .route('/profile', profile)
  .route('/team', team);

const app = factory
  .createApp()
  .use(logger())
  .use(sessionMiddleware())
  .route('', api)
  .onError((err, c) => {
    if (err instanceof HTTPException) {
      return err.getResponse();
    }

    return c.text('Internal Server Error', 500);
  });

export default app;

/*
 * The following code is commented out because it is not yet implemented.
 * They ensure that the server is secure and that the origin and host are validated.
 *
 * import { testOrigin, validateOriginAndHost } from './security';
 * import { cors } from 'hono/cors';
 * import { csrf } from 'hono/csrf';
 * import { secureHeaders } from 'hono/secure-headers';
 *
 * .use(secureHeaders())
 * .use(
 *   cors({
 *     origin: (origin, _) =>
 *       testOrigin(origin) ? origin : 'http://example.org',
 *     credentials: true
 *   })
 * )
 * .use(
 *   csrf({
 *     origin: (origin, _) => testOrigin(origin)
 *   })
 * )
 * .use(validateOriginAndHost())
 */
