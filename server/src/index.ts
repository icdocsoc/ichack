import app from './app';
import { websocket } from './websocket';

Bun.serve({
  fetch: app.fetch,
  port: Bun.env.PORT || 3000,
  websocket
});
