import { beforeAll, beforeEach, describe, expect, test } from 'bun:test';
import { db } from '../../drizzle';
import { users } from '../../auth/schema';
import { categories, companies } from '../schema';
import { createUserWithSession } from '../../testHelpers';
import app from '../../app';
import { testClient } from 'hono/testing';
import { roles } from '../../types';
import { eq, sql } from 'drizzle-orm';

const sessionIds: Partial<Record<(typeof roles)[number], string>> = {};

const client = testClient(app).api;
const kotlinCategory = {
  title: 'App development in Kotlin',
  owner: 'JetBrains',
  image: 'http://example.org/static/jetbrains.png',
  shortDescription: 'Kotlin is a great language',
  longDescription: 'http://example.org/static/kotlin.md'
};
const kotlinCategoryWithSlug = {
  ...kotlinCategory,
  slug: 'jetbrains-app-development-in-kotlin'
};

beforeAll(async () => {
  await db.execute(sql`TRUNCATE ${users} CASCADE`);
  await db.execute(sql`TRUNCATE ${categories} CASCADE`);
  await db.execute(sql`TRUNCATE ${companies} CASCADE`);

  for (const role of roles) {
    const { sessionId } = await createUserWithSession(role, {
      name: 'Nishant',
      email: `${role}@ic.ac.uk`,
      password: 'dontheckme'
    });
    sessionIds[role] = sessionId;
  }

  await db.insert(companies).values({ name: kotlinCategory.owner });
});

describe('Category Module > POST /', () => {
  beforeEach(async () => {
    await db.delete(categories);
  });

  test('Successfully creates a category', async () => {
    const res = await client.category.$post(
      {
        json: kotlinCategory
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.admin}`
        }
      }
    );

    expect(res.status).toBe(201);

    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.title, kotlinCategory.title));

    expect(category).toHaveLength(1);
    expect(category[0]).toEqual({
      slug: 'jetbrains-app-development-in-kotlin',
      ...kotlinCategory
    });
  });

  test('Nobody except admin/god can create a category', async () => {
    for (const role of roles) {
      if (role === 'admin') continue;
      if (role === 'god') continue;

      const res = await client.category.$post(
        {
          json: kotlinCategory
        },
        {
          headers: {
            Cookie: `auth_session=${sessionIds[role]}`
          }
        }
      );

      // @ts-ignore this can return 403
      expect(res.status).toBe(403);
    }
  });
  test('Duplicate name returns 409', async () => {
    const res = await client.category.$post(
      {
        json: kotlinCategory
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.admin}`
        }
      }
    );
    expect(res.status).toBe(201);

    const res2 = await client.category.$post(
      {
        json: kotlinCategory
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.admin}`
        }
      }
    );
    expect(res2.status).toBe(409);
  });
});

describe('Category Module > PUT /:slug', () => {
  beforeEach(async () => {
    await db.delete(categories);
    await db.insert(categories).values(kotlinCategoryWithSlug);
  });

  test('Successfully edits a category', async () => {
    const newCategory = {
      shortDescription: 'Kotlin is a great language 2',
      longDescription: 'http://example.org/static/kotlin2.md'
    };
    const res = await client.category[':slug'].$put(
      {
        param: {
          slug: kotlinCategoryWithSlug.slug
        },
        json: newCategory
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.admin}`
        }
      }
    );

    expect(res.status).toBe(200);

    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, kotlinCategoryWithSlug.slug));

    expect(category).toHaveLength(1);
    expect(category[0]).toEqual({ ...kotlinCategoryWithSlug, ...newCategory });
  });
  test('Nobody except admin/god/sponsor can edit a category', async () => {
    const newCategory = {
      shortDescription: 'Kotlin is a great language 2',
      longDescription: 'http://example.org/static/kotlin2.md'
    };

    for (const role of roles) {
      if (role === 'admin') continue;
      if (role === 'god') continue;
      if (role === 'sponsor') continue;

      const res = await client.category[':slug'].$put(
        {
          param: {
            slug: kotlinCategory.title
          },
          json: newCategory
        },
        {
          headers: {
            Cookie: `auth_session=${sessionIds[role]}`
          }
        }
      );

      // @ts-ignore this can return 403
      expect(res.status).toBe(403);
    }
  });
  test('Invalid name returns 404', async () => {
    const res = await client.category[':slug'].$put(
      {
        param: {
          slug: 'terra-title'
        },
        json: {
          shortDescription: 'Invalid description',
          longDescription: 'https://example.org/static/invalid.md'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.admin}`
        }
      }
    );

    expect(res.status).toBe(404);
  });
  test('Can change the title', async () => {
    const newTitle = 'New Title';
    const res = await client.category[':slug'].$put(
      {
        param: {
          slug: kotlinCategoryWithSlug.slug
        },
        json: {
          title: newTitle
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.admin}`
        }
      }
    );

    expect(res.status).toBe(200);

    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.title, newTitle));

    expect(category).toHaveLength(1);
    expect(category[0]).toEqual({
      ...kotlinCategory,
      title: newTitle,
      slug: 'jetbrains-new-title'
    });
  });
});

describe('Category Module > DELETE /:title', () => {
  beforeEach(async () => {
    await db.delete(categories);
    await db.insert(categories).values(kotlinCategoryWithSlug);
  });

  test('Successfully deletes a category', async () => {
    const res = await client.category[':slug'].$delete(
      {
        param: {
          slug: kotlinCategoryWithSlug.slug
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.admin}`
        }
      }
    );

    expect(res.status).toBe(200);

    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, kotlinCategoryWithSlug.slug));

    expect(category).toHaveLength(0);
  });
  test('Nobody except admin/god can delete a category', async () => {
    for (const role of roles) {
      if (role === 'admin') continue;
      if (role === 'god') continue;

      const res = await client.category[':slug'].$delete(
        {
          param: {
            slug: kotlinCategoryWithSlug.slug
          }
        },
        {
          headers: {
            Cookie: `auth_session=${sessionIds[role]}`
          }
        }
      );

      // @ts-ignore this can return 403
      expect(res.status).toBe(403);
    }
  });
  test('Invalid name returns 404', async () => {
    const res = await client.category[':slug'].$delete(
      {
        param: {
          slug: 'terra-title'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.admin}`
        }
      }
    );

    expect(res.status).toBe(404);
  });
});
