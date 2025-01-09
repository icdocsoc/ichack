import { AsyncResult, Result } from 'typescript-result';
import type { User, UserCredentials } from '#shared/types';

export default function () {
  const client = useHttpClient();

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
      const res = await client.auth.logout.$post();

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
