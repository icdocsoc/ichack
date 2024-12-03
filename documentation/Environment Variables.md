---
created: 2024-09-04
authors:
  - Nishant
---
Copy the `.env.template` file to `.env.local` and `.env.test` and fill in the values with the correct information.
## Dev setup (.env.local)

```env
PGUSER=admin
PGPASSWORD=rootpasswd
PGDB=postgres
PGHOST=0.0.0.0
PGPORT=5432
PGCA=

DISCORD_CLIENT_ID=anything, you'll know if you're testing this
DISCORD_SERVER_ID=see above
DISCORD_CLIENT_SECRET=see above
```

## Test setup (.env.test)

```env
PGUSER=test
PGPASSWORD=test
PGDB=postgres
PGHOST=0.0.0.0
PGPORT=5432
PGCA=

DISCORD_CLIENT_ID=
DISCORD_SERVER_ID=
DISCORD_CLIENT_SECRET=
```