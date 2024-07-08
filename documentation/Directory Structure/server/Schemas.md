---
created: 2024-07-08
authors:
  - Nishant
---
Nishant looked at different sources to build the schema and understand how to use [[Drizzle]] to connect it to [[PostgreSQL]]. One was [Lucia's example repo](https://github.com/lucia-auth/examples/tree/main/hono/username-and-password) and the other was last year's firebase database. Nishant converted the important mandatory bits of it to an SQL table schema. 

All schemas live under `db/schema/*.ts` and they are referenced in `src/etc/db.ts`. Read the files comments to understand more.