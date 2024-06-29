import type { Context, Next } from 'hono';
import { verifyRequestOrigin } from 'lucia';
import { customLogger } from './logger';

export const validateOriginAndHost = () => async (c: Context, next: Next) => {
  if (c.req.method == 'GET')
    // Allow all GET requests
    return next();

  const originHeader = c.req.header('Origin') ?? null;
  const hostHeader = c.req.header('Host') ?? null;
  if (
    !originHeader ||
    !hostHeader ||
    !verifyRequestOrigin(originHeader, [hostHeader])
  )
    // Reject requests with invalid origin
    return c.body(null, 403);

  return next();
};

export const testOrigin = (origin: string): boolean => {
  return /^http:\/\/admin\.example\.org$/.test(origin);
};
