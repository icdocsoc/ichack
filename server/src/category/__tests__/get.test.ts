import { beforeAll, describe, expect, test } from 'bun:test';
import { db } from '../../drizzle';
import { categories, companies } from '../schema';
import { createUserWithSession } from '../../testHelpers';
import { testClient } from 'hono/testing';
import app from '../../app';
import { users } from '../../auth/schema';
import { sql } from 'drizzle-orm';
import { adminMeta } from '../../admin/schema';
import { roles } from '../../types';

const sessionIds: Partial<Record<string, string>> = {};
const client = testClient(app);

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
  await db.execute(sql`TRUNCATE ${adminMeta} CASCADE`);

  await db
    .insert(companies)
    .values(testCategories.map(c => ({ name: c.owner })));
  await db.insert(categories).values(testCategories);

  for (const role of roles) {
    const { sessionId } = await createUserWithSession(role, {
      name: 'Nishant',
      email: `${role}@ic.ac.uk`,
      password: 'dontheckme'
    });
    sessionIds[role] = sessionId;
  }

  // The default state is that categories are not shown
  // for the tests to show categories, set to true, test and then set back to false
  await db.insert(adminMeta).values({ showCategories: false, mealNumber: -1 });
});

describe('Category Module > GET /', () => {
  test('No one but gods can see all categories when unpublished', async () => {
    for (const role of roles) {
      const res = await client.category.$get(
        {
          param: {
            slug: kotlinCategory.slug
          }
        },
        {
          headers: {
            Cookie: `auth_session=${sessionIds[role]}`
          }
        }
      );

      if (role === 'god') {
        expect(res.status).toBe(200);
        expect(res.json()).resolves.toEqual(testCategories);
      } else {
        expect(res.status).toBe(404);
        expect(res.text()).resolves.toBe('Categories not found');
      }
    }
  });

  test('Every authenticated user can see all categories when published', async () => {
    await db.update(adminMeta).set({ showCategories: true });

    for (const role of roles) {
      const res = await client.category.$get(
        {
          param: {
            slug: kotlinCategory.slug
          }
        },
        {
          headers: {
            Cookie: `auth_session=${sessionIds[role]}`
          }
        }
      );

      expect(res.status).toBe(200);
      expect(res.json()).resolves.toEqual(testCategories);
    }

    await db.update(adminMeta).set({ showCategories: false });
  });

  test('Unauthenticated user cannot get any categories', async () => {
    const res = await client.category.$get();

    // @ts-ignore this can return 403
    expect(res.status).toBe(403);
    expect(res.text()).resolves.toBe(
      'You do not have access to GET /api/category'
    );
  });
});

describe('Category Module > GET /:slug', () => {
  test('No one but gods can see the kotlin category when unpublished', async () => {
    for (const role of roles) {
      const res = await client.category[':slug'].$get(
        {
          param: {
            slug: kotlinCategory.slug
          }
        },
        {
          headers: {
            Cookie: `auth_session=${sessionIds[role]}`
          }
        }
      );

      if (role === 'god') {
        expect(res.status).toBe(200);
        expect(res.json()).resolves.toEqual(kotlinCategory);
      } else {
        expect(res.status).toBe(404);
        expect(res.text()).resolves.toBe(
          `Category with slug '${kotlinCategory.slug}' does not exist`
        );
      }
    }
  });

  test('Every authenticated user can see the kotlin category when published', async () => {
    await db.update(adminMeta).set({ showCategories: true });

    for (const role of roles) {
      const res = await client.category[':slug'].$get(
        {
          param: {
            slug: kotlinCategory.slug
          }
        },
        {
          headers: {
            Cookie: `auth_session=${sessionIds[role]}`
          }
        }
      );

      expect(res.status).toBe(200);
      expect(res.json()).resolves.toEqual(kotlinCategory);
    }

    await db.update(adminMeta).set({ showCategories: false });
  });

  test('Unauthenticated user cannot get any categories', async () => {
    const res = await client.category[':slug'].$get({
      param: {
        slug: kotlinCategory.slug
      }
    });

    // @ts-ignore this can return 403
    expect(res.status).toBe(403);
    expect(res.text()).resolves.toBe(
      `You do not have access to GET /api/category/${kotlinCategory.slug}`
    );
  });

  test('Invalid category returns 404', async () => {
    let res = await client.category[':slug'].$get(
      {
        param: {
          slug: 'terra-title'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.hacker}`
        }
      }
    );
    expect(res.status).toBe(404);
    expect(res.text()).resolves.toBe(
      "Category with slug 'terra-title' does not exist"
    );

    // even with showCategories set to true, the category should not be found
    await db.update(adminMeta).set({ showCategories: true });
    res = await client.category[':slug'].$get(
      {
        param: {
          slug: 'terra-title'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.hacker}`
        }
      }
    );
    expect(res.status).toBe(404);
    expect(res.text()).resolves.toBe(
      "Category with slug 'terra-title' does not exist"
    );

    await db.update(adminMeta).set({ showCategories: false });
  });
});
