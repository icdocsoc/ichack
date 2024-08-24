import { beforeAll, describe, expect, test } from 'bun:test';
import { db } from '../../drizzle';
import { categories, companies } from '../schema';
import { createUserWithSession } from '../../testHelpers';
import { testClient } from 'hono/testing';
import app from '../../app';
import { users } from '../../auth/schema';
import { sql } from 'drizzle-orm';

let hackerSession: string;
const client = testClient(app).api;

const kotlinCategory = {
  slug: 'jetbrains-app-development-in-kotlin',
  title: 'App development in Kotlin',
  owner: 'JetBrains',
  image: 'jetbrains.png',
  shortDescription: 'Kotlin is a great language',
  longDescription: 'kotlin.md'
};

const quantCategory = {
  slug: 'optiver-quant-trading',
  title: 'Quant Trading',
  owner: 'Optiver',
  image: 'optiver.png',
  shortDescription: 'Develop Quant Trading strategies',
  longDescription: 'quant_trading.md'
};

const educationCategory = {
  slug: 'docsoc-education',
  title: 'Education',
  owner: 'DoCSoc',
  image: 'docsoc.png',
  shortDescription: 'Create apps for students',
  longDescription: 'education.md'
};

const testCategories = [kotlinCategory, quantCategory, educationCategory];

beforeAll(async () => {
  await db.execute(sql`TRUNCATE ${users} CASCADE`);
  await db.execute(sql`TRUNCATE ${companies} CASCADE`);
  await db.execute(sql`TRUNCATE ${categories} CASCADE`);

  await db
    .insert(companies)
    .values(testCategories.map(c => ({ name: c.owner })));
  await db.insert(categories).values(testCategories);

  const { sessionId } = await createUserWithSession('hacker', {
    name: 'Nishant',
    email: 'nj421@ic.ac.uk',
    password: 'dontheckme'
  });
  hackerSession = sessionId;
});

describe('Category Module > GET /', () => {
  test('Successfully gets all categories', async () => {
    const res = await client.category.$get(
      {},
      {
        headers: {
          Cookie: `auth_session=${hackerSession}`
        }
      }
    );
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveLength(3);
    expect(data).toContainEqual(kotlinCategory);
    expect(data).toContainEqual(quantCategory);
    expect(data).toContainEqual(educationCategory);
  });
  test('Unauthenticated user cannot get any categories', async () => {
    const res = await client.category.$get();

    // @ts-ignore this can return 403
    expect(res.status).toBe(403);
  });
  test.skip('Hackers & Volunteers cannot see categories until time', async () => {
    expect(true).toBe(false); // dummy test fails
    // TODO to be implemented
  });
});

describe('Category Module > GET /:title', () => {
  test('Successfully get a category', async () => {
    const res = await client.category[':slug'].$get(
      {
        param: {
          slug: kotlinCategory.slug
        }
      },
      {
        headers: {
          Cookie: `auth_session=${hackerSession}`
        }
      }
    );
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toEqual(kotlinCategory);
  });
  test('Unauthenticated user cannot get any categories', async () => {
    const res = await client.category[':slug'].$get({
      param: {
        slug: kotlinCategory.title
      }
    });

    // @ts-ignore this can return 403
    expect(res.status).toBe(403);
  });
  test('Invalid category returns 404', async () => {
    const res = await client.category[':slug'].$get(
      {
        param: {
          slug: 'terra-title'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${hackerSession}`
        }
      }
    );

    expect(res.status).toBe(404);
  });
  test.skip('Hackers & Volunteers cannot see categories until time', async () => {
    expect(true).toBe(false); // dummy test fails
    // TODO to be implemented
  });
});
