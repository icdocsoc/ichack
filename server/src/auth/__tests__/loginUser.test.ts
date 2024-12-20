import { describe, test, expect, beforeAll } from 'bun:test';
import { testClient } from 'hono/testing';
import app from '../../app';
import { createUser } from '../../testHelpers';
import { db } from '../../drizzle';
import { users, userSession } from '../schema';
import { hash } from 'argon2';
import { hashOptions } from '../lucia';
import { eq, sql } from 'drizzle-orm';

beforeAll(async () => {
  await db.execute(sql`TRUNCATE ${users} CASCADE`);

  const hashed = await hash('Plea#eDontH3ckMe', hashOptions);
  await createUser('god', {
    name: 'Nishant',
    email: 'nj421@ic.ac.uk',
    password: hashed
  });

  await createUser('hacker', {
    name: 'John',
    email: 'johndoe@ic.ac.uk',
    password: null
  });
});

const client = testClient(app);

describe('Auth Module > POST /login', () => {
  test('A valid user can login', async () => {
    const res = await client.auth.login.$post({
      json: {
        email: 'nj421@ic.ac.uk',
        password: 'Plea#eDontH3ckMe'
      }
    });
    expect(res.status).toBe(200);

    const cookies = res.headers.getSetCookie();
    expect(cookies.length).toBe(1);

    const cookieToken = cookies[0].split(';')[0].split('=')[1];
    const session = await db
      .select()
      .from(userSession)
      .where(eq(userSession.id, cookieToken));
    expect(session).toHaveLength(1);
  });

  test('Invalid email is rejected', async () => {
    const res = await client.auth.login.$post({
      json: {
        email: 'someotheremail@ic.ac.uk',
        password: 'Plea#eDontH3ckMe'
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
    const res = await client.auth.login.$post({
      json: {
        email: 'nj421@ic.ac.uk',
        password: 'IH3eckedY#u'
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
    const res = await client.auth.login.$post({
      json: {
        email: 'johndoe@ic.ac.uk', // User with null password
        password: 'Plea#eDontH3ckMe'
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
    const res = await client.auth.login.$post({
      // @ts-ignore password is missing for testing purposes
      json: {
        email: 'nj421@ic.ac.uk'
      }
    });

    // @ts-ignore this can return 400
    expect(res.status).toBe(400);
    expect(res.text()).resolves.toBe(
      "'password' is either missing or not a string"
    );

    const cookies = res.headers.getSetCookie();
    expect(cookies.length).toBe(0);

    const res2 = await client.auth.login.$post({
      // @ts-ignore password is missing for testing purposes
      json: {
        password: 'dontheckme'
      }
    });

    // @ts-ignore this can return 400
    expect(res2.status).toBe(400);
    expect(res2.text()).resolves.toBe(
      "'email' is either missing or not a string; Property 'password' does not satisfy the conditions"
    );

    const cookies2 = res2.headers.getSetCookie();
    expect(cookies2.length).toBe(0);
  });

  test('Authenticated user cannot login again', async () => {
    // login once
    const res = await client.auth.login.$post({
      json: {
        email: 'nj421@ic.ac.uk',
        password: 'Plea#eDontH3ckMe'
      }
    });
    expect(res.status).toBe(200);

    // login twice
    const cookies = res.headers.getSetCookie();
    const res2 = await client.auth.login.$post(
      {
        json: {
          email: 'nj421@ic.ac.uk',
          password: 'Plea#eDontH3ckMe'
        }
      },
      {
        headers: {
          Cookie: cookies[0]
        }
      }
    );

    expect(res2.status).toBe(409);
    expect(res2.text()).resolves.toBe('You are already logged in');
  });
});
