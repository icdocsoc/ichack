import app from './app';

Bun.serve({
  fetch: app.fetch,
  port: Bun.env.PORT || 3000
});
