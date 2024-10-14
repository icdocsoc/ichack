import type { ProfileRepository } from '@base/repository/profileRepository';
import { hc } from 'hono/client';
import type { Perry, User } from '@shared/types';
import { Result } from 'typescript-result';
export class HonoProfileRepo implements ProfileRepository {
  private profileService;
  constructor(baseUrl: string) {
    this.profileService = hc<Perry>(baseUrl).api.profile;
  }
  async getUsers(): Promise<Result<User[], Error>> {
    const token = useCookie('auth_session');
    return Result.try(async () => {
      // Sending get request to the server and getting the response
      const response = await this.profileService.all.$get(undefined, {
        headers: {
          Cookie: `auth_session=${token.value}`
        }
      });
      const responseFields = await response.json();
      return responseFields;
    });
  }
  async getSelf(): Promise<Result<User, Error>> {
    return Result.try(async () => {
      const token = useCookie('auth_session');
      const response = await this.profileService.$get(undefined, {
        headers: {
          Cookie: `auth_session=${token.value}`
        }
      });
      switch (response.status) {
        case 200:
          return await response.json();
      }
      throw new Error("Couldn't get self, status: " + response.status);
    });
  }
}
