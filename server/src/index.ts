import { Hono } from 'hono';
import { apiLogger } from './middlewares/logger';
import { testOrigin, validateOriginAndHost } from './middlewares/security';
import { session } from './middlewares/session';
import api from './routes';
import type { SessionContext } from './etc/context';
import { cors } from 'hono/cors';
import { csrf } from 'hono/csrf';

const app = new Hono<SessionContext>();

app.use(apiLogger());
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
app.use(session());

app.route('/', api);

export default app;
