import app from '../server/src';
import { z } from 'zod';
import { selectUserSchema } from '../server/src/auth/schema';
import type { postAuthLoginBody } from '../server/src/auth';

export type Perry = typeof app;
export type User = z.infer<typeof selectUserSchema>;
export type UserCredentials = z.infer<typeof postAuthLoginBody>;
