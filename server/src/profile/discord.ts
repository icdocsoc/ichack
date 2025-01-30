import { sha256 } from 'hono/utils/crypto';
import assert from 'assert/strict';
import buildUrl from 'build-url-ts';
import { Result } from 'typescript-result';

const baseUrl = Bun.env.BASE_URL;
const internalDiscordUrl = `${baseUrl}/api/profile/discord`;

const discord = {
  clientId: process.env.DISCORD_CLIENT_ID,
  serverId: process.env.DISCORD_SERVER_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  scopes: ['guilds.join', 'identify'],
  apiBase: 'https://discord.com/api/v10'
};

export class DiscordRepository {
  private readonly sessionId: string;
  private state?: string;
  private code?: string;
  private hash: string | null = null;

  constructor(sessionId: string, state?: string, code?: string) {
    this.sessionId = sessionId;
    this.state = state;
    this.code = code;
  }

  async initAndGetHash(): Promise<string | null> {
    this.hash = await sha256(this.sessionId);
    return this.hash;
  }

  shouldRedirect(): boolean {
    return !this.state && !this.code;
  }

  redirectUrl(): string {
    assert.ok(this.shouldRedirect());

    return buildUrl('https://discord.com/', {
      path: 'oauth2/authorize',
      queryParams: {
        response_type: 'code',
        client_id: discord.clientId,
        scope: discord.scopes.join(' '),
        redirect_uri: internalDiscordUrl,
        prompt: 'consent',
        state: this.hash
      }
    })!; // This function never returns an undefined value: https://github.com/meabed/build-url-ts/issues/503
  }

  areStateAndCodeValid(): boolean {
    assert.ok(!this.shouldRedirect());

    return this.state === this.hash && this.code != undefined;
  }

  async addUserToServer(
    name: string,
    role: 'hacker' | 'volunteer'
  ): Promise<Result<string | 'already_present', Error>> {
    assert.ok(this.areStateAndCodeValid());

    const data = {
      grant_type: 'authorization_code',
      code: this.code!,
      redirect_uri: internalDiscordUrl,
      client_id: discord.clientId!,
      client_secret: discord.clientSecret!,
      scope: discord.scopes.join(' ')
    };

    const tokenReq = await fetch('https://discord.com/api/v10/oauth2/token', {
      method: 'POST',
      body: new URLSearchParams(data).toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    const token = await tokenReq.json();

    const userReq = await fetch(`${discord.apiBase}/users/@me`, {
      method: 'GET',
      headers: {
        Authorization: `${token.token_type} ${token.access_token}`
      }
    });
    const discordUser = await userReq.json();

    const roles: string[] = [];
    if (role === 'hacker') {
      roles.push(process.env.DISCORD_HACKER_ROLE_ID!);
    } else if (role === 'volunteer') {
      roles.push(process.env.DISCORD_VOLUNTEER_ROLE_ID!);
    }

    const addToServerReq = await fetch(
      `${discord.apiBase}/guilds/${discord.serverId}/members/${discordUser.id}`,
      {
        method: 'PUT',
        headers: {
          authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          access_token: token.access_token,
          nick: name,
          roles
        })
      }
    );

    const status = addToServerReq.status;

    switch (status) {
      case 201:
        return Result.ok(discordUser.id as string);
      case 204:
        return Result.ok('already_present');
      default:
        const failure = await addToServerReq.text();
        return Result.error(new Error(failure));
    }
  }

  static async removeUser(userId: string) {
    const res = await fetch(
      `${discord.apiBase}/guilds/${discord.serverId}/members/${userId}`,
      {
        method: 'DELETE',
        headers: {
          authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return res.status;
  }
}
