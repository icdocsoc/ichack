import logger, { apiLogger } from './logger';
import sessionMiddleware from './auth/sessionMiddleware';
import auth from './auth';
import admin from './admin';
import announcement from './announcement';
import category from './category';
import event from './event';
import profile from './profile';
import team from './team';
import qr from './qr';
import factory from './factory';
import { HTTPException } from 'hono/http-exception';
import sudo from './sudo';
import { cors } from 'hono/cors';
import { testOrigin } from './security';
import { pass } from './pass';

const api = factory
  .createApp()
  .route('/admin', admin)
  .route('/announcement', announcement)
  .route('/auth', auth)
  .route('/category', category)
  .route('/event', event)
  .route('/profile', profile)
  .route('/team', team)
  .route('/qr', qr)
  .route('/pass', pass);

const app = factory
  .createApp()
  .use(logger())
  .use(sessionMiddleware())
  .use(sudo())
  .use(
    cors({
      origin: (origin, _) =>
        testOrigin(origin) ? origin : 'https://ichack.org'
    })
  )
  .route('', api)
  .onError((err, c) => {
    apiLogger.error(c, 'Error Response', `MAYDAY MAYDAY, ${err.message}`);
    if (err instanceof HTTPException) {
      return err.getResponse();
    }

    return c.text("Interal Server Error. We're looking into it", 500);
  });

export default app;

/*
 * The following code is commented out because it is not yet implemented.
 * They ensure that the server is secure and that the origin and host are validated.
 *
 * import { csrf } from 'hono/csrf';
 * import { secureHeaders } from 'hono/secure-headers';
 *
 * .use(secureHeaders())
 * .use(
 *   csrf({
 *     origin: (origin, _) => testOrigin(origin)
 *   })
 * )
 * .use(validateOriginAndHost())
 */
