import { Result } from 'typescript-result';
import type { Profile, User, UserCredentials } from '~~/shared/types';

export default () => {
  const headers = useRequestHeaders(['cookie']);

  const getProfiles = (): Promise<Result<Profile[], Error>> =>
    Result.try(async () => {
      const req = await $fetch('/api/profile/all', {
        method: 'GET'
      });

      if (req.error) {
        throw req.error;
      }

      return req;
    });

  const getSelf = (): Promise<Result<Profile, Error>> =>
    Result.try(async () => {
      const req = await $fetch('/api/profile', {
        method: 'GET',
        headers: headers
      });

      if (req.error) {
        throw req.error;
      }

      return req;
    });

  return {
    getProfiles,
    getSelf
  };
};
