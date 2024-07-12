import { Hono } from 'hono';
import logger from './logger';
import { testOrigin, validateOriginAndHost } from './security';
import { cors } from 'hono/cors';
import { csrf } from 'hono/csrf';
import sessionMiddleware from './auth/sessionMiddleware';
import auth from './auth';
import { installModule } from './module';
import { websocket } from './websocket';
import profile from './profile';

const app = new Hono();

app.use(logger());
app.use(
  cors({
    origin: (origin, _) => (testOrigin(origin) ? origin : 'http://example.org'),
    credentials: true
  })
);
app.use(
  csrf({
    origin: (origin, _) => testOrigin(origin)
  })
);
app.use(validateOriginAndHost());
app.use(sessionMiddleware());

installModule(app, auth);
installModule(app, profile);

Bun.serve({
  fetch: app.fetch,
  port: process.env.PORT || 3000,
  websocket
});

export default app;
