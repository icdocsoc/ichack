import { eq } from 'drizzle-orm';
import { db } from './drizzle';
import factory from './factory';
import { users } from './auth/schema';
import { apiLogger } from './logger';

// To save us from having to make routes such as admin/removeUserFromTeam, admin/updateUserProfile, etc.
// we create a sudo middleware, which allows us to hit routes as if we were another user.
// This is also useful for reproducing bug reports.

export default () =>
  factory.createMiddleware(async (ctx, next) => {
    const user = ctx.get('user');
    if (!user || user.role !== 'god') {
      return next();
    }

    const suHeader = ctx.req.header('X-sudo-user');
    if (!suHeader) {
      return next();
    }

    const suUser = await db.select().from(users).where(eq(users.id, suHeader));
    if (suUser.length < 1) {
      return ctx.text('User not found', 404);
    }

    apiLogger.info(ctx, `Sudoed as ${suUser[0]!.name} (id: ${suUser[0]!.id})`);

    ctx.set('user', {
      email: suUser[0]!.email,
      id: suUser[0]!.id,
      role: suUser[0]!.role
    });

    return next();
  });
