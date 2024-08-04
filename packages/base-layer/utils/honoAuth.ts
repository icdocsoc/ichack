import type { AuthServer } from '@base/repository/authRepository';
import { hc } from 'hono/client';
import type { Perry, UserCredentials } from '@shared/types';

export class HonoAuthRepo implements AuthServer {
  private authService;

  constructor(baseUrl: string) {
    this.authService = hc<Perry>(baseUrl).api.auth;
  }

  async loginUser(credentials: UserCredentials): Promise<Response> {
    const response = await this.authService.login.$post({
      json: credentials
    });
    return response;
  }
}
