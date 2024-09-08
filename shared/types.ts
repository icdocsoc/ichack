import app from '../server/src/app';
import { z } from 'zod';
import { selectUserSchema } from '../server/src/auth/schema';
import type { createUserBody, loginBody } from '../server/src/auth';

export type Perry = typeof app;
export type User = z.infer<typeof selectUserSchema>;
export type UserCredentials = z.infer<typeof loginBody>;
export type CreateUserDetails = z.infer<typeof createUserBody>;
export { roles } from '../server/src/types';

/** The password pattern is as follows:
 * 1. At least 8 characters long
 * 2. At least one uppercase letter
 * 3. At least one lowercase letter
 * 4. At least one number
 */
export const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,}$/;
