import type { AuthRepository } from '@base/repository/authRepository';
import { hc } from 'hono/client';
import type {
  CreateUserDetails,
  Perry,
  UserCredentials,
  User
} from '@shared/types';
import { Result } from 'typescript-result';

export class HonoAuthRepo implements AuthRepository {
  private authService;

  constructor(baseUrl: string) {
    this.authService = hc<Perry>(baseUrl).api.auth;
  }

  async loginUser(credentials: UserCredentials): Promise<Result<User, Error>> {
    return Result.try(async () => {
      // Sending post request to the server and getting the response
      const response = await this.authService.login.$post({
        json: credentials
      });
      const responseFields = await response.json();
      return responseFields;
    });
  }

  async createUser(details: CreateUserDetails): Promise<Result<User, Error>> {
    return Result.try(async () => {
      // Sending post request to the server and getting the response
      const response = await this.authService.create.$post({
        json: details
      });
      const responseFields = await response.json();
      return responseFields;
    });
  }

  async deleteUser(id: string): Promise<Result<void, Error>> {
    return Result.try(async () => {
      const response = await this.authService[':id'].$delete({
        param: {
          id: id
        }
      });
      if (response.status !== 200) {
        throw new Error(await response.text());
      }
    });
  }

  async fetchUser(id: string): Promise<Result<User, Error>> {
    return Result.try(async () => {
      // // Sending get request to the server and getting the response
      // const response = await this.authService.$get({ id });
      // const responseFields = await response.json();
      // return responseFields;
      throw new Error('Not implemented');
    });
  }

  async updateUser(
    id: string,
    details: CreateUserDetails
  ): Promise<Result<User, Error>> {
    // return Result.try(async () => {
    //   // Sending put request to the server and getting the response
    //   const response = await this.authService.update.$put({
    //     param: {
    //       id: id,
    //       name: details.name,
    //       email: details.email,
    //       role: details.role
    //     }
    //   });
    //   const responseFields = await response.json();
    //   return responseFields;
    throw new Error('Not implemented');
  }

  async getSelf(): Promise<Result<User, Error>> {
    return Result.try(async () => {
      const token = useCookie('auth_session');

      const response = await this.authService.$get(undefined, {
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

  async getUsers(): Promise<Result<User[], Error>> {
    return Result.try(async () => {
      const token = useCookie('auth_session');

      // Sending get request to the server and getting the response
      // const response = await this.authService.users.$get(undefined, {
      //   headers: {
      //     Cookie: `auth_session=${token.value}`
      //   }
      // });
      // const responseFields = await response.json();
      return [];
    });
  }

  async logout(): Promise<Result<void, Error>> {
    return Result.try(async () => {
      const token = useCookie('auth_session');

      // Sending post request to the server and getting the response
      const response = await this.authService.logout.$post(undefined, {
        headers: {
          Cookie: `auth_session=${token.value}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to logout');
      }
    });
  }
}
