import { test, expect, mock, describe } from 'bun:test';
import server from '..';

describe('Auth routes', () => {
  test('should return 403 if user is not authenticated', async () => {
    const req = new Request('https://localhost:3000/auth/users');
    const response = await server.request(req);

    expect(response.status).toBe(403);
  });
});
