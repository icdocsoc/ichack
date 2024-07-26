import app from '../server/src';
import { z } from 'zod';
import { selectUserSchema } from '../server/src/auth/schema';

export type Perry = typeof app;
export type User = z.infer<typeof selectUserSchema>;
