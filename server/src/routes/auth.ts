import {
  users,
  type UserInsertModel,
  type UserSelectModel
} from '@schema/users';
import { hash, verify } from 'argon2';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { generateId } from 'lucia';
import { db } from '../etc/db';
import { getDummyPassword, hashOptions, lucia } from '../etc/auth';
import { eq } from 'drizzle-orm';

const auth = new Hono();

auth.post('/signup', async c => {
  const body = await c.req.parseBody<Omit<UserInsertModel, 'role'>>();

  const { name, email, password } = body;
  if (!email || !password) {
    throw new HTTPException(400, {
      message: 'Email and password are required'
    });
  }

  if (!validateEmail(email) || !validatePassword(password)) {
    throw new HTTPException(400, {
      message: 'Invalid email or password'
    });
  }

  if (!name) {
    throw new HTTPException(400, {
      message: 'Name is required'
    });
  }

  const passwordHash = await hash(password, hashOptions);
  const userId = generateId(15);

  const rowsAffected = await db
    .insert(users)
    .values({
      ...body,
      id: userId,
      password: passwordHash,
      role: 'admin'
    })
    .onConflictDoNothing()
    .returning();

  if (rowsAffected.length === 0) {
    throw new HTTPException(409, {
      message: 'Email already exists'
    });
  }

  const session = await lucia.createSession(userId, {});
  c.header('Set-Cookie', lucia.createSessionCookie(session.id).serialize(), {
    append: true
  });
  return c.text('OK', 201);
});

auth.post('/login', async c => {
  const body =
    await c.req.parseBody<Pick<UserSelectModel, 'email' | 'password'>>();
  const { email, password } = body;

  if (!email || !password) {
    throw new HTTPException(400, {
      message: 'Email and password are required'
    });
  }

  const user = await db.select().from(users).where(eq(users.email, email));
  const hashedPassword =
    user && user.length ? user[0].password : await getDummyPassword();

  const validPassword = await verify(hashedPassword, password, hashOptions);
  if (!validPassword) {
    throw new HTTPException(401, {
      message: 'Invalid email or password'
    });
  }

  const session = await lucia.createSession(user[0].id, {});
  c.header('Set-Cookie', lucia.createSessionCookie(session.id).serialize(), {
    append: true
  });
  c.header('Location', '/', { append: true });
  return c.text('OK', 200); // TODO return the user instead.
});

function validateEmail(email: string): boolean {
  return true; // TODO replace with actual validation
}

function validatePassword(password: string): boolean {
  return true; // TODO replace with actual validation
}

export default auth;
