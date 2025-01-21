# Server

The server is a [Hono](../../tech-stack/hono) application that is artificially connected to the Nuxt application (see `nuxt.config.ts`). Its entrypoint is `index.ts`. The server is a (in gradle project terms) a multi-modular build. See [Modules](./modules/index) to learn how they are the foundational building blocks of the server.

> [!note]
> Do not get confused by the middlewares inside `server/src` and the subdomain middleware in `server/middleware`. The subdomain middleware is part of the Nitro family while everything inside `src` is the Hono family. The routes inside `src` are only invoked when the path starts with a `/api`.

## Requests & Responses

[Routes](./routes) define the different entrypoint interactions from the frontend. Each route will have different request bodies, if at all. If you are an authenticated user accessing the route, you need to send in a Cookie called `auth_session` with the session ID.

1. Every successful response (2xx) will return a json.
2. Every failed response (4xx/5xx) will return a text.

## Middlewares

It goes through multiple middlewares to make sure that the request to safe to process it. It will include defining CSRF Protection (which may be unnecessary).

There are 3 other middlewares that the server uses:

1. Session middleware - every incoming request passes through this middleware. It searches for the `auth_session` cookie and authenticates you before you go further.
2. grantAccessTo - auth protected routes use this middleware. This middleware requests the roles that are allowed to access the route. The "all" parameter grants to everyone while "authenticated" grants the role to anyone with a valid auth token.
3. zValidator - This middleware comes from `@hono/zod-validator`. This validates the body of the request with [Zod](../../technologies/zod).

## Fine-grained Access Security

However, we need to make sure that users still can't forge any request somehow and get unauthorised data. We have multiple roles for a user and that should determine which API Endpoint they have access to execute. This can be done easily by a middleware which checks if the user has the required roles to go further into the route.

![](/access_permissions.png)

- `grantAccessTo('all')` sits on the top, anyone could access that route.
- `grantAccessTo('authenticated')` - if this is present, then any authenticated user can access that route.
- the roles under 'authenticated' are of the same level. Some routes may need only hacker and volunteer but admins cannot access that, eg.

::: info
The `sponsor` role was removed in [PR#186](https://github.com/icdocsoc/ichack/pull/186)
:::