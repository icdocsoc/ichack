---
created: 2024-07-13
authors:
  - Nishant
---
Every sub-directory inside the `server/` directory is considered a **module**. A module *in this project* contains their routes and possibly a schema.
These modules are *pluggable* in the server code. In `src/app.ts`, you can import the module and route it with the `.route(url, app)` function by Hono.

## Modules

These certain modules are considered `core` since they the bare bones of what makes IC Hack. There is no special folder these but it is logical to lay them flat because *technically, then can be installed/uninstalled at will*.

The core modules for IC Hack are:
- **announcement** - to show important messages from admins on the day.
- **admin** - contains miscellaneous information such as meal timings, max team, etc.
- **auth** - to authenticate users.
- **category** - to show and display DoCSoc and Sponsor challenges and their description.
- **event** - to show public and private events held with location and timing information.
- **profile** - to manage a users profile, including cv upload and names.
- **team** - to create and manage teams that a user is in.

Other modules are considered `feature` modules for the other spicy and fun experiences IC Hack provides during the day. This may be features like collecting demographics or awarding points for interacting with sponsors.

To create a feature module, make sure you have an `[feat]/index.ts` file with the Hono routes. See other modules for reference. Import those routes into `src/app.ts` and route them in the app.