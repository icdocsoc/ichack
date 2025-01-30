import { z } from 'zod';
import { postLoginBody } from './schemas';
import app from '~~/server/src/app';
import { selectUserSchema } from '~~/server/src/auth/schema';
import { eventSchema } from '~~/server/src/event/schema';
import { registerProfileSchema } from './schemas';

export {
  tShirtSizes,
  genders,
  yearsOfStudy
} from '~~/server/src/demograph/schema';
export { roles } from '~~/server/src/types';
export type { AdminSelectProfile } from '~~/server/src/profile/schema';
export type { Role } from '~~/server/src/types';

export type UserCredentials = z.infer<typeof postLoginBody>;
export type PerryApi = typeof app;
export type User = z.infer<typeof selectUserSchema>;
export type { UserAndProfile as Profile } from '~~/server/src/profile/schema';
export type Event = z.infer<typeof eventSchema>;
export type EventLocation = Event['locations'][number];
export type RegistrationDetails = z.infer<typeof registerProfileSchema>;
