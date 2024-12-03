---
created: 2024-07-04
authors:
 - Nishant
---
## System Requirements

This is not an exhaustive list.
- [[Bun]] v1.1.18
- Node v22.2.0
- [[Docker]] v26.1.3
- PostreSQL v16.3

> [!note]
> You may install the latest versions of these in the future but they may not run the project as expected. If that is the case, try installing these specific versions if you want it to run.

> [!important]
> If you use Windows, please try working on WSL2 since our codebase works best inside a Unix/Linux environment.
> If you use MacOS, you may not be able to run this code. Check out the [[MacOS issue]] here in detail.

## How to run?

### Install the dependencies
Execute `bun install` in the route directory.

### Setup the Database
1. If the schema has been updated and your local instance of postgres is not synced with it, you can reset this by executing `bun reset-db`. 
2. Seed the database with some predefined entries by executing `bun run scripts/seed.ts` while the database is running. This file contains the email and password to login as a `god`.

### Environment Variables
You would need to set [[Environment Variables]] for the containers to spin up properly. 

### Development 
In the root directory of the project, execute:
```bash
bun run dev
```

This starts the postgres container and runs the application in Dev mode with Hot Reload. You can visit the following websites in the url:
1. http://localhost:3000 for the Landing Page.
2. http://my.localhost:3000 for the Internal Page.
3. http://admin.localhost:3000 for the Admin Page.

The API can be accessed under any of the above domains, but with the `/api/` route above, e.g. `http://localhost:3000/api/profile/all`

### Production
To view how the code would look in production, execute:
```bash
bun run preview
```

This starts two containers inside of a [[Docker#Docker Networks|docker network]]. This is how the production code would look like.

Refer to [[Docker]] to learn about how we containerised it and used compose.