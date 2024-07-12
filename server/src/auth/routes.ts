import { Hono } from 'hono';
// import { db } from '../drizzle';
// import { users } from './schema';

const routes = new Hono();

// routes.get('/users', async c => {
//   const allUsers = await db.select().from(users);
//   return c.json(allUsers);
// });

export default routes;
