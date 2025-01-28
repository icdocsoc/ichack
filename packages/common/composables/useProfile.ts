import { AsyncResult, Result } from 'typescript-result';
import type { Profile, RegistrationDetails } from '#shared/types';

export default () => {
  const client = useHttpClient();

  const getProfiles = (): AsyncResult<Profile[], Error> =>
    Result.try(async () => {
      const res = await client.profile.all.$get();
      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage);
      }

      const profiles = await res.json();
      return profiles;
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

  return {
    getProfiles,
    getSelf,
    register,
    getRegistrationStats
  };
};
