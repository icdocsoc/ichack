import { eq } from 'drizzle-orm';
import { db } from '../drizzle';
import factory from '../factory';
import { grantAccessTo } from '../security';
import {
  sponsorCompany,
  categories,
  insertCategorySchema,
  companies
} from './schema';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const createCategorySchema = insertCategorySchema.omit({ slug: true });
const sponsorUpdateCategorySchema = insertCategorySchema
  .pick({ image: true, shortDescription: true, longDescription: true })
  .partial()
  .strict();
const adminUpdateCategorySchema = insertCategorySchema
  .pick({
    title: true,
    image: true,
    shortDescription: true,
    longDescription: true
  })
  .partial()
  .partial()
  .strict();

const slugPattern = /^[a-z0-9-]+$/;
const generateSlug = (owner: string, title: string): string =>
  [owner, ...title.split(' ')].join('-').toLowerCase();

const category = factory
  .createApp()
  /**
   * Any authenticated user can get all categories
   */
  .get('/', grantAccessTo('authenticated'), async c => {
    // TODO Restrict this based on time. Logic to be determined later

    const all = await db.select().from(categories);
    return c.json(all, 200);
  })
  /**
   * Any authenticated user can get a single category by slug
   */
  .get(
    '/:slug',
    grantAccessTo('authenticated'),
    zValidator('param', z.object({ slug: z.string().regex(slugPattern) })),
    async c => {
      const { slug } = c.req.valid('param');

      const category = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, slug));

      if (category.length < 1) return c.text(`Category ${slug} not found`, 404);

      // slug is primary key. So, there can be only one category
      return c.json(category[0], 200);
    }
  )
  /**
   * Admins can create new categories where the slug is auto-generated
   */
  .post(
    '/',
    grantAccessTo('admin'),
    zValidator('json', createCategorySchema, (result, c) => {
      if (!result.success) {
        return c.text('Invalid request', 400); // TODO make this better
      }
    }),
    async c => {
      const category = c.req.valid('json');

      const owners = await db
        .select()
        .from(companies)
        .where(eq(companies.name, category.owner));

      if (owners.length === 0)
        return c.text(`Category's owner ${category.owner} was not found`, 404);
      // company name is primary key. So, there can be only one

      const slug = generateSlug(category.owner, category.title);

      try {
        await db.insert(categories).values({
          ...category,
          slug
        });
        return c.json({}, 201);
      } catch (e) {
        // TODO Inspect the type of error in error handling
        // @ts-ignore
        return c.text(e.message, 409);
      }
    }
  )
  /**
   * Admins can update any category based on the slug.
   * Admins can also update the title which auto-generates the slug.
   *
   * Sponsors can only update the description, shortDescription, and image.
   */
  .put(
    '/:slug',
    grantAccessTo('admin', 'sponsor'),
    zValidator('param', z.object({ slug: z.string().regex(slugPattern) })),
    zValidator('json', adminUpdateCategorySchema, (result, c) => {
      if (!result.success) {
        return c.text('Invalid request', 400); // TODO make this better
      }
    }),
    async c => {
      // Admins can change everything about the category
      // Slug is auto-generated based on the owner and title
      const { slug } = c.req.valid('param');
      const user = c.get('user')!; // Not null because of grantAccessTo

      const categoriesInDb = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, slug));

      if (categoriesInDb.length === 0) return c.text('Category not found', 404);
      // slug is primary key. So, there can be only one category

      const category = categoriesInDb[0];
      const newCategory = c.req.valid('json');
      if (user.role == 'sponsor') {
        // Sponsor cannot change the title or the owner of the category
        // This is done because adminUpdateCategorySchema is more permissive
        // than sponsorUpdateCategorySchema. This is a hacky way to do it.
        const result =
          await sponsorUpdateCategorySchema.safeParseAsync(newCategory);
        if (!result.success) {
          return c.text('Invalid request', 400); // TODO make this better
        }

        // Check if the sponsor is allowed to update the category
        const sponsorCompanies = await db
          .select()
          .from(sponsorCompany)
          .where(eq(sponsorCompany.userId, user.id));

        if (sponsorCompanies.length === 0)
          return c.text("You don't not have your company registered", 404);
        // user id is primary key. So, there can be only one sponsor company

        if (category.owner !== sponsorCompanies[0].companyName)
          return c.text('You are not allowed to update this category', 403);
      }

      const newSlug = generateSlug(
        category.owner,
        newCategory.title ?? category.title // Use the old title if the new one is not provided
      );
      try {
        await db
          .update(categories)
          .set({ ...newCategory, slug: newSlug })
          .where(eq(categories.slug, slug));
        return c.json({}, 200);
      } catch (e) {
        // TODO Inspect the type of error in error handling
        // @ts-ignore
        return c.text(e.message, 409);
      }
    }
  )
  /**
   * Admins can delete categories
   */
  .delete(
    '/:slug',
    grantAccessTo('admin'),
    zValidator('param', z.object({ slug: z.string().regex(slugPattern) })),
    async c => {
      const { slug } = c.req.valid('param');

      try {
        const affectedRows = await db
          .delete(categories)
          .where(eq(categories.slug, slug))
          .returning();

        if (affectedRows.length === 0) return c.text('Category not found', 404);
        // slug is primary key. So, there can be only one category

        return c.json({}, 200);
      } catch (e) {
        // TODO Inspect the type of error in error handling
        // @ts-ignore
        return c.text(e.message, 500);
      }
    }
  );

export default category;
