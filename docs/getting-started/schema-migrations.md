---
order: 4
---

# Schema Migrations

Unfortunately, Jay+Nishant+Team still had to make tweaks to the database schema 1 week before the event (AAHHH!!!). But the database migrations weren't affecting major parts of the database that were in use. A guide on how to do the migrations:

## Use `bun backend:generate --name=<reason>`

Execute `bun backend:generate --name=<reason>` with the reason being something short and descriptive like `init`, `hackspace`, `schedule`, `qr`, etc. This command will do 3 things:

1. Update `schemas/meta/_journal.json`.
2. Create a snapshot of the schema in `schemas/meta` like `schemas/meta/XXXX_snapshot.json`.
3. Create the migration sql to XXXX as `schemas/XXXX_<reason>.sql`.

You should use `bun backend:push-schema` from the root directory to upload the schema based on postgres' [environment variables](./environment-variables.md).

## Migrations with Merge/Rebase Conflicts

If two or more PRs introduce a schema migration, then the first PR to merge with main gets to merge without conflicts. 

1. If update your branch with main, you will likely receive conflicts in `schemas/meta/_journal.json` and `schemas/meta/XXXX_snapshot.json`. **Choose the conflict resolution that belongs to main**.
2. If you don't get any conflicts, it doesn't matter.
3. Delete the migration files you created in your branch and return any modified meta json files to main. Essentially, restore the state of the `schemas/` folder to exactly how it is in main.
4. Execute `bun backend:generate --name=<reason>` like earlier and push to git remote.