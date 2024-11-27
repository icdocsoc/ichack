import { Result } from 'typescript-result';
import type { User, UserCredentials } from '~~/shared/types';

export default () => {
  const loginUser = (
    credentials: UserCredentials
  ): Promise<Result<User, Error>> =>
    Result.try(async () => {
      const res = await $fetch('/api/auth/login', {
        method: 'POST',
        body: credentials
      });

      if (res.error) {
        throw res.error;
      }

      console.log(res);

      return res;
    });

  const logOut = (): Promise<Result<void, Error>> =>
    Result.try(async () => {
      const req = await $fetch('/api/auth/logout', {
        method: 'POST'
      });

      if (req.error) {
        throw req.error;
      }
    });

  return {
    loginUser,
    logOut
  };
};
