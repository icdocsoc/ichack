import { AsyncResult, Result } from 'typescript-result';
import type { Profile } from '#shared/types';

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

  return {
    getProfiles,
    getSelf
  };
};
