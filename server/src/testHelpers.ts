/**
 * This file is used to create test helpers that can be used in the test files.
 */

import { users, userSession } from './auth/schema';
import { db } from './drizzle';
import type { roles } from './types';

export const today = new Date();
export const tomorrow = new Date(today);
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

export const socketEvent = async <T, E extends keyof WebSocketEventMap>(
  ws: WebSocket,
  event: E,
  handler: (ev: WebSocketEventMap[E]) => T,
  timeout: number = 1000
) => {
  return await new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout waiting for ${event}`));
    }, timeout);

    ws.addEventListener(
      event,
      ev => {
        clearTimeout(timer);
        resolve(handler(ev));
      },
      { once: true }
    );
  });
};
