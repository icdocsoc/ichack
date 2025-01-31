import { AsyncResult, Result } from 'typescript-result';
import type {
  Profile,
  RegistrationDetails,
  AdminSelectProfile,
  Role,
  UpdateProfile
} from '#shared/types';

export type FlatUserProfile = {
  id: string;
  name: string;
  email: string;
  role: Role;

  isRegistered: boolean;
  photosOptOut?: boolean;
  dietaryRestrictions?: string[];
  cvUploaded?: boolean;
  pronouns?: string | null;
  meals?: boolean[];

  hasLinkedQR: boolean;
  qrUuid?: string;
};

export default () => {
  const client = useHttpClient();

  const getProfiles = (): Promise<Result<FlatUserProfile[], Error>> =>
    Result.try(async () => {
      const res = await client.profile.all.$get();
      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage);
      }

      const profiles: AdminSelectProfile[] = await res.json();
      const flattenedProfiles = profiles.map(profile => {
        return {
          id: profile.users.id,
          name: profile.users.name,
          email: profile.users.email,
          role: profile.users.role,

          isRegistered: profile.profiles !== null,
          photosOptOut: profile.profiles?.photos_opt_out,
          dietaryRestrictions: profile.profiles?.dietary_restrictions,
          cvUploaded: profile.profiles?.cvUploaded,
          pronouns: profile.profiles?.pronouns,
          meals: profile.profiles?.meals,

          hasLinkedQR: profile.qr !== null,
          qrUuid: profile.qr?.uuid
        };
      });
      return flattenedProfiles;
    });

  const getSelf = (): AsyncResult<Profile, Error> =>
    Result.try(async () => {
      const res = await client.profile.$get();

      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage);
      }

      const profile = await res.json();
      return profile;
    });

  const register = (
    token: string,
    details: RegistrationDetails,
    cv?: File
  ): AsyncResult<void, Error> =>
    Result.try(async () => {
      const body = {
        cv: cv,
        registrationDetails: JSON.stringify(details)
      };

      // This is weird, but Zod is mad because otherwise cv is send as the string "undefined"
      if (!cv) delete body.cv;

      const res = await client.profile.register.$post({
        query: { token },
        form: body
      });

      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage);
      }
      return;
    });

  const getRegistrationStats = async () =>
    Result.try(async () => {
      const res = await client.profile.register.stats.$get();

      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage);
      }

      return res.json();
    });

  const unsetMeal = async (
    userId: string,
    mealNum: number
  ): Promise<Result<void, Error>> =>
    Result.try(async () => {
      const res = await client.profile.meal.$delete({
        json: {
          userId: userId,
          mealNum: mealNum
        }
      });

      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage);
      }
    });

  const updateProfile = (
    newProfile: UpdateProfile
  ): Promise<Result<void, Error>> => {
    return Result.try(async () => {
      const res = await client.profile.$put({
        json: newProfile
      });

      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage);
      }

      return Result.ok();
    });
  };

  // Only gods will be able to do this because the route requires the use of the
  // sudo middleware
  const deleteCV = async (userId: string): Promise<Result<void, Error>> =>
    Result.try(async () => {
      const res = await client.profile.cv.$delete(
        {},
        {
          headers: {
            'X-sudo-user': userId
          }
        }
      );

      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage);
      }
    });

  return {
    getProfiles,
    getSelf,
    register,
    getRegistrationStats,
    unsetMeal,
    deleteCV,
    updateProfile
  };
};
