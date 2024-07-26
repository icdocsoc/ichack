import { createFactory } from 'hono/factory';
import type { Env } from './types';

export default createFactory<Env>();
