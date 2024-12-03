import { z } from 'zod';
import { postLoginBody } from './schemas';
import app from '~~/server/src/app';
import { selectUserSchema } from '~~/server/src/auth/schema';

export { roles } from '~~/server/src/types';

export type UserCredentials = z.infer<typeof postLoginBody>;
export type PerryApi = typeof app;
export type User = z.infer<typeof selectUserSchema>;
export type { Profile } from '~~/server/src/profile/schema';
