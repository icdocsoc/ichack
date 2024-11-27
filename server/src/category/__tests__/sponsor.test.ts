import { beforeAll, beforeEach, describe, expect, test } from 'bun:test';
import { roles } from '../../types';
import { testClient } from 'hono/testing';
import app from '../../app';
import { sponsorCompany, categories, companies } from '../schema';
import { db } from '../../drizzle';
import { users } from '../../auth/schema';
import { createUserWithSession } from '../../testHelpers';
import { eq, sql } from 'drizzle-orm';

const sessionIds: Partial<Record<(typeof roles)[number], string>> = {};
let kotlinOwnerId: string;

const client = testClient(app);
const kotlinCategory = {
  slug: 'jetbrains-app-development-in-kotlin',
  title: 'App development in Kotlin',
  owner: 'JetBrains',
  image: 'http://example.org/static/jetbrains.png',
  shortDescription: 'Kotlin is a great language',
  longDescription: 'http://example.org/static/kotlin.md'
};
const quantCategory = {
  slug: 'optiver-quant-trading',
  title: 'Quant Trading',
  owner: 'Optiver',
  image: 'optiver.png',
  shortDescription: 'Develop Quant Trading strategies',
  longDescription: 'quant_trading.md'
};

beforeAll(async () => {
  await db.execute(sql`TRUNCATE ${users} CASCADE`);
  await db.execute(sql`TRUNCATE ${categories} CASCADE`);
  await db.execute(sql`TRUNCATE ${companies} CASCADE`);
  await db.execute(sql`TRUNCATE ${sponsorCompany} CASCADE`);

  await db.insert(companies).values({ name: kotlinCategory.owner });
  await db.insert(companies).values({ name: quantCategory.owner });

  for (const role of roles) {
    const { sessionId, userId } = await createUserWithSession(role, {
      name: 'Nishant',
      email: `${role}@ic.ac.uk`,
      password: 'dontheckme'
    });
    sessionIds[role] = sessionId;

    if (role === 'sponsor') {
      kotlinOwnerId = userId;
      await db
        .insert(sponsorCompany)
        .values({ userId, companyName: kotlinCategory.owner });
    }
  }
});

describe('Category Module > PUT /:slug', () => {
  beforeEach(async () => {
    await db.delete(categories);
    await db.insert(categories).values(kotlinCategory);
  });

  test('Successfully edits their category', async () => {
    const res = await client.category[':slug'].$put(
      {
        param: {
          slug: kotlinCategory.slug
        },
        json: {
          shortDescription: 'Changed description'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.sponsor}`
        }
      }
    );

    expect(res.status).toBe(200);

    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.title, kotlinCategory.title));

    expect(category).toHaveLength(1);
    expect(category[0].shortDescription).toBe('Changed description');
  });
  test('Cannot edit a non-existent category', async () => {
    const res = await client.category[':slug'].$put(
      {
        param: {
          slug: 'non-existent'
        },
        json: {
          shortDescription: 'Changed description'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.sponsor}`
        }
      }
    );

    expect(res.status).toBe(404);
  });
  test("Cannot edit another company's category", async () => {
    const res = await client.category[':slug'].$put(
      {
        param: {
          slug: quantCategory.slug
        },
        json: {
          shortDescription: 'Changed description'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.sponsor}`
        }
      }
    );

    // sponsor 'jetbrains' attempting to edit optiver's category
    expect(res.status).toBe(404);
  });
  test('Sponsor without a company returns 404', async () => {
    await db.delete(sponsorCompany);

    const res = await client.category[':slug'].$put(
      {
        param: {
          slug: kotlinCategory.slug
        },
        json: {
          shortDescription: 'Changed description'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.sponsor}`
        }
      }
    );

    expect(res.status).toBe(404);

    // Restore the sponsor company
    await db.insert(sponsorCompany).values({
      userId: kotlinOwnerId,
      companyName: kotlinCategory.owner
    });
  });
  test('Cannot change title/owner of category', async () => {
    const res = await client.category[':slug'].$put(
      {
        param: {
          slug: kotlinCategory.slug
        },
        json: {
          title: 'Java',
          // @ts-ignore for testing purposes
          owner: 'Oracle'
        }
      },
      {
        headers: {
          Cookie: `auth_session=${sessionIds.sponsor}`
        }
      }
    );

    expect(res.status).toBe(400);
  });
});
