---
created: 2024-07-05
authors:
 - Nishant
---
PostgreSQL [website](https://www.postgresql.org/) but Nishant used [this](https://chatgpt.com) for the documentation.

From IC Hack '24, it was clear that NoSQL is bad for our kind of data. Each entity relates with every other entity is some way or the other. NoSQL database would be slow and difficult to manage. SQL's JOIN and SELECT syntax would benefit in faster DB operations and better code quality and data interpretation overall. 

## Why not MySQL or SQLite?

PostgreSQL has `LISTEN` and `NOTIFY` syntax that we can take advantage of when communicating real-time data via [[SSE]].

## What's PgAdmin?

PgAdmin is a GUI website tool that allows one to graphically view the database and execute queries. We can also connect to this website from the outside world. 