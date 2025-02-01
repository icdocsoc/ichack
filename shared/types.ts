import { z } from 'zod';

import { postLoginBody } from './schemas';

import app from '~~/server/src/app';
import { selectUserSchema } from '~~/server/src/auth/schema';
import { eventSchema } from '~~/server/src/event/schema';
import { metadataSchema } from '~~/server/src/admin/schema';
import { registerProfileSchema } from './schemas';
import {
  createAnnouncementSchema,
  selectAnnouncementSchema
} from '../server/src/announcement/schema';
import type { qrSchema } from '~~/server/src/qr/schema';
import type { createChallenge } from '~~/server/src/hackspace/schema';
import { updateProfileSchema } from '~~/server/src/profile/schema';
import { categorySchema } from '~~/server/src/category/schema';

export {
  tShirtSizes,
  genders,
  yearsOfStudy
} from '~~/server/src/demograph/schema';
export { roles } from '~~/server/src/types';
export type { AdminSelectProfile } from '~~/server/src/profile/schema';
export type { Role } from '~~/server/src/types';

export type PerryApi = typeof app;

export type UserCredentials = z.infer<typeof postLoginBody>;
export type User = z.infer<typeof selectUserSchema>;
export type Event = z.infer<typeof eventSchema>;
export type EventLocation = Event['locations'][number];
export type RegistrationDetails = z.infer<typeof registerProfileSchema>;
export type Challenge = z.infer<typeof createChallenge>;

export type {
  TeamIdName,
  UserTeamStatus,
  TeamMember,
  TeamInvite,
  WholeTeamData,
  Team
} from '~~/server/src/team/schema';
export type { UserAndProfile as Profile } from '~~/server/src/profile/schema';

export type AdminMetadata = z.infer<typeof metadataSchema>;

export type Category = z.infer<typeof categorySchema>;

export type AnnouncementId = number;
export type CreateAnnouncementDetails = z.infer<
  typeof createAnnouncementSchema
>;
export type AnnouncementDetails = z.infer<typeof selectAnnouncementSchema> & {
  synced: boolean;
};

export type QrCode = z.infer<typeof qrSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
