import { describe, test, expect, mock, beforeAll } from 'bun:test';
import { testClient } from 'hono/testing';
import app from '../../app';
import { createUser } from '../../testHelpers';
import { db } from '../../drizzle';
import { users } from '../schema';
import { sql } from 'drizzle-orm';

beforeAll(async () => {
  await db.execute(sql`TRUNCATE ${users} CASCADE`);

  await createUser('god', {
    name: 'Nishant',
    email: 'nj421@ic.ac.uk',
    password: 'dontheckme'
  });

  await createUser('hacker', {
    name: 'John',
    email: 'johndoe@ic.ac.uk',
    password: null
  });
});

const client = testClient(app).api;

describe('Auth Module > POST /login', () => {
  test('A valid user can login', async () => {
    // MOCKS
    mock.module('argon2', () => ({
      async verify(
        digest: string,
        password: string,
        _: object = {}
      ): Promise<boolean> {
        return digest == password;
      }
    }));

    // TEST
    const res = await client.auth.login.$post({
      json: {
        email: 'nj421@ic.ac.uk',
        password: 'dontheckme'
      }
    });

    expect(res.status).toBe(200);

    const cookies = res.headers.getSetCookie();
    expect(cookies.length).toBe(1);
    expect(cookies[0]).toMatch(/auth_session=[a-zA-Z0-9]+/);

    mock.restore();
  });

  test('Invalid email is rejected', async () => {
    // TEST
    const res = await client.auth.login.$post({
      json: {
        email: 'someotheremail@ic.ac.uk',
        password: 'dontheckme'
      }
    });

    expect(res.status).toBe(401);
    const msg = await res.text();
    expect(msg).toBe(
      'Invalid email or password. Have you completed the sign up process?'
    );

    const cookies = res.headers.getSetCookie();
    expect(cookies.length).toBe(0);
  });

  test('Invalid password is rejected', async () => {
    // TEST
    const res = await client.auth.login.$post({
      json: {
        email: 'nj421@ic.ac.uk',
        password: 'iheckedyou'
      }
    });

    expect(res.status).toBe(401);
    const msg = await res.text();
    expect(msg).toBe(
      'Invalid email or password. Have you completed the sign up process?'
    );

    const cookies = res.headers.getSetCookie();
    expect(cookies.length).toBe(0);
  });

  test('User with null password is rejected', async () => {
    // TEST
    const res = await client.auth.login.$post({
      json: {
        email: 'johndoe@ic.ac.uk', // User with null password
        password: 'dontheckme'
      }
    });

    expect(res.status).toBe(401);
    const msg = await res.text();
    expect(msg).toBe(
      'Invalid email or password. Have you completed the sign up process?'
    );

    const cookies = res.headers.getSetCookie();
    expect(cookies.length).toBe(0);
  });

  test('Missing email or password', async () => {
    // TEST
    const res = await client.auth.login.$post({
      // @ts-ignore password is missing for testing purposes
      json: {
        email: 'nj421@ic.ac.uk'
      }
    });

    // @ts-ignore this can return 400
    expect(res.status).toBe(400);
    expect(await res.text()).toBe('Email and password are required');

    const cookies = res.headers.getSetCookie();
    expect(cookies.length).toBe(0);

    // TEST 2
    const res2 = await client.auth.login.$post({
      // @ts-ignore password is missing for testing purposes
      json: {
        password: 'dontheckme'
      }
    });

    // @ts-ignore this can return 400
    expect(res2.status).toBe(400);
    expect(await res2.text()).toBe('Email and password are required');

    const cookies2 = res2.headers.getSetCookie();
    expect(cookies2.length).toBe(0);
  });
});
