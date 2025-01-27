---
order: 3
---

# Environment Variables

Copy the `.env.template` file to `.env.local` and `.env.test` and fill in the values with the correct information. Ask the admins for credentials for staging and prod environemnts. Read [Bun's docs](https://bun.sh/docs/runtime/env) to understand the naming convention and how to force using one env file.

## Dev setup (`.env.local`)

```bash
PGUSER=admin
PGPASSWORD=rootpasswd
PGDB=postgres
PGHOST=0.0.0.0
PGPORT=5432
PGCA=

DISCORD_CLIENT_ID= # anything, you'll know if you're testing this
DISCORD_SERVER_ID= # see above
DISCORD_CLIENT_SECRET= # see above
```

## Test setup (`.env.test`)

```bash
PGUSER=test
PGPASSWORD=test
PGDB=postgres
PGHOST=0.0.0.0
PGPORT=5433
PGCA=

DISCORD_CLIENT_ID=
DISCORD_SERVER_ID=
DISCORD_CLIENT_SECRET=
```