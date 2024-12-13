import { AsyncResult, Result } from 'typescript-result';
import type { User, UserCredentials } from '#shared/types';

export default function () {
  const loginUser = (credentials: UserCredentials): AsyncResult<User, Error> =>
    Result.try(async () => {
      const res = await client.auth.login.$post({
        json: credentials
      });
      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage);
      }

      const userBody = await res.json();
      return userBody;
    });

  const logout = (): AsyncResult<void, Error> =>
    Result.try(async () => {
      const sessionToken = useCookie('auth_session');
      const res = await client.auth.logout.$post(undefined, {
        headers: {
          Cookie: `auth_session=${sessionToken}`
        }
      });

      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage);
      }
    });

  return {
    loginUser,
    logout
  };
}
