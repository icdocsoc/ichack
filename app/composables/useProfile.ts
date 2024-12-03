import { AsyncResult, Result } from 'typescript-result';
import type { Profile } from '#shared/types';

export default () => {
  const headers = useRequestHeaders(['cookie']);
  const cookie = headers.cookie ?? '';

  const getProfiles = (): AsyncResult<Profile[], Error> =>
    Result.try(async () => {
      const res = await client.profile.all.$get(undefined, {
        headers: {
          Cookie: cookie
        }
      });
      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage);
      }

      const profiles = await res.json();
      return profiles;
    });

  const getSelf = (): AsyncResult<Profile, Error> =>
    Result.try(async () => {
      console.log('In server, before request call');
      const res = await client.profile.$get(undefined, {
        headers: {
          Cookie: cookie
        }
      });
      console.log('In server, AFTER request call');

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
