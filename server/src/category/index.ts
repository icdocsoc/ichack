import { eq, or } from 'drizzle-orm';
import { db } from '../drizzle';
import factory from '../factory';
import { grantAccessTo } from '../security';
import {
  categories,
  insertCategorySchema,
  companies,
  judgingTable,
  updateJudgingSchema
} from './schema';
import { z } from 'zod';
import { simpleValidator } from '../validators';
import { adminMeta } from '../admin/schema';
import { teamMembers, teams } from '../team/schema';

const createCategorySchema = insertCategorySchema.omit({ slug: true });
const godUpdateCategorySchema = insertCategorySchema
  .pick({
    title: true,
    image: true,
    shortDescription: true,
    longDescription: true
  })
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
  .get('/', grantAccessTo(['authenticated']), async c => {
    const user = c.get('user')!;

    const meta = await db
      .select({ showCategories: adminMeta.showCategories })
      .from(adminMeta);

    if (!meta[0]!.showCategories && user.role !== 'god')
      return c.text('Categories not found', 404);

    const all = await db.select().from(categories);
    return c.json(all, 200);
  })
  .get('/judging', grantAccessTo(['authenticated']), async ctx => {
    const user = ctx.get('user')!;
    const team = await db
      .select({
        sponsorCategory: teams.sponsorCategory,
        docsocCategory: teams.docsocCategory
      })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(eq(teamMembers.userId, user.id));

    if (
      team.length == 0 ||
      !team[0]!.sponsorCategory ||
      !team[0]!.docsocCategory
    )
      return ctx.text(
        'User is not in a team or did not select categories.',
        404
      );

    const res = await db
      .select({
        company: categories.owner,
        title: categories.title,
        slug: categories.slug,
        hackspace: judgingTable.hackspace
      })
      .from(judgingTable)
      .innerJoin(categories, eq(judgingTable.category, categories.slug))
      .where(
        or(
          eq(judgingTable.category, team[0]!.sponsorCategory!),
          eq(judgingTable.category, team[0]!.docsocCategory!)
        )
      );

    return ctx.json(res, 200);
  })
  .get('/judging/all', grantAccessTo(['authenticated']), async ctx => {
    const res = await db
      .select({
        title: categories.title,
        company: categories.owner,
        category: categories.title,
        slug: categories.slug,
        hackspace: judgingTable.hackspace
      })
      .from(judgingTable)
      .rightJoin(categories, eq(judgingTable.category, categories.slug));

    return ctx.json(res, 200);
  })
  .put(
    '/judging',
    grantAccessTo(['admin']),
    simpleValidator('json', updateJudgingSchema),
    async ctx => {
      const body = ctx.req.valid('json');

      try {
        await db
          .insert(judgingTable)
          .values(body)
          .onConflictDoUpdate({
            target: judgingTable.category,
            set: {
              hackspace: body.hackspace
            }
          });

        return ctx.json({}, 200);
      } catch {
        return ctx.text('Category does not exist.', 404);
      }
    }
  )
  /**
   * Any authenticated user can get a single category by slug
   */
  .get(
    '/:slug',
    grantAccessTo(['authenticated']),
    simpleValidator('param', z.object({ slug: z.string().regex(slugPattern) })),
    async c => {
      const user = c.get('user')!;

      const meta = await db
        .select({ showCategories: adminMeta.showCategories })
        .from(adminMeta);

      const { slug } = c.req.valid('param');
      if (!meta[0]!.showCategories && user.role !== 'god')
        return c.text(`Category with slug '${slug}' does not exist`, 404);

      const category = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, slug));

      if (category.length < 1)
        return c.text(`Category with slug '${slug}' does not exist`, 404);

      // slug is primary key. So, there can be only one category
      return c.json(category[0]!, 200);
    }
  )
  /**
   * Gods can create new categories where the slug is auto-generated
   * This assumes that the long description is a URL to a markdown file
   * already uploaded prior to this request.
   */
  .post(
    '/',
    grantAccessTo(['god']),
    simpleValidator('json', createCategorySchema),
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
      } catch (e: any) {
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
    grantAccessTo(['god']),
    simpleValidator('param', z.object({ slug: z.string().regex(slugPattern) })),
    simpleValidator('json', godUpdateCategorySchema),
    async c => {
      // Admins can change everything about the category
      // Slug is auto-generated based on the owner and title
      const { slug } = c.req.valid('param');

      const categoriesInDb = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, slug));

      if (categoriesInDb.length === 0)
        return c.text(`Category with slug '${slug}' does not exist`, 404);
      // slug is primary key. So, there can be only one category

      const category = categoriesInDb[0]!;
      const newCategory = c.req.valid('json');

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
      } catch (e: any) {
        return c.text(e.message, 409);
      }
    }
  )
  /**
   * Gods can delete categories
   */
  .delete(
    '/:slug',
    grantAccessTo(['god']),
    simpleValidator('param', z.object({ slug: z.string().regex(slugPattern) })),
    async c => {
      const { slug } = c.req.valid('param');

      try {
        const affectedRows = await db
          .delete(categories)
          .where(eq(categories.slug, slug))
          .returning();

        if (affectedRows.length === 0)
          return c.text(`Category with slug '${slug}' does not exist`, 404);
        // slug is primary key. So, there can be only one category

        return c.json({}, 200);
      } catch (e: any) {
        return c.text(e.message, 500);
      }
    }
  );
export default category;
