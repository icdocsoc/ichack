import { Hono } from 'hono';
import validateAccess from '../validateAccess';

const auth = new Hono().get(
  '/users',
  validateAccess('authenticated'),
  async c => {
    return c.json([{ name: 'John Doe' }]);
  }
);

export default auth;
