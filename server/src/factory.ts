import { createFactory } from 'hono/factory';
import type { Env } from './context';

export default createFactory<Env>();
