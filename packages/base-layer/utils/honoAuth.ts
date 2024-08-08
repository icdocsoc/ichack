import type { AuthRepository } from '@base/repository/authRepository';
import { hc } from 'hono/client';
import type { Perry, User, UserCredentials, UserState } from '@shared/types';
import { Result } from 'typescript-result';

export class HonoAuthRepo implements AuthRepository {
  private authService;

  constructor(baseUrl: string) {
    this.authService = hc<Perry>(baseUrl).api.auth;
  }

  async loginUser(
    credentials: UserCredentials
  ): Promise<Result<UserState, Error>> {
    return Result.try(
      async () => {
        // Sending post request to the server and getting the response
        const response = await this.authService.login.$post({
          json: credentials
        });
        const responseFields = await response.json();
        return responseFields;
      },
      err => new Error('Error in post request', { cause: err })
    );
  }
}
