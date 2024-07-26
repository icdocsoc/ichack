/**
 * This file is used to create test helpers that can be used in the test files.
 */

import { users, userSession } from './auth/schema';
import { db } from './drizzle';
import type { PgInsertValue } from 'drizzle-orm/pg-core';
import type { roles } from './types';

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);

export const createUserWithSession = async (
  role: (typeof roles)[number],
  body: { name: string; email: string; password: string }
): Promise<{ userId: string; sessionId: string }> => {
  const sessionId = `${role}_session`;
  const userId = await createUser(role, body);

  await db.insert(userSession).values({
    id: sessionId,
    userId,
    expiresAt: tomorrow
  });

  return { userId, sessionId };
};

export const createUser = async (
  role: (typeof roles)[number],
  body: { name: string; email: string; password: string | null }
): Promise<string> => {
  const userId = `${role}_user`;
  const user = {
    id: userId,
    role: role,
    ...body
  };
  await db.insert(users).values(user);
  return userId;
};
