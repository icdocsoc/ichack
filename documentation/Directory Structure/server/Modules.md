---
created: 2024-07-13
authors:
  - Nishant
---
Every sub-directory inside the `server/` directory is considered a **module**. A module *in this project* contains their routes and possibly a schema.
These modules are *pluggable* in the server code. In `src/index.ts`, you can import the module and route it with the `.route(url, app)` function by Hono.

## Core Modules

These certain modules are considered `core` since they the bare bones of what makes IC Hack. There is no special folder these (*just yet*) but it is logical to lay them flat because *technically, then can be installed/uninstalled at will*.

The core modules for IC Hack are:
- **announcement** - to show important messages from admins on the day.
- **auth** - to authenticate users.
- **category** - to show and display DoCSoc and Sponsor challenges and their description.
- **event** - to show public and private events held with location and timing information.
- **profile** - to manage a users profile, including cv upload and names.
- **team** - to create and manage teams that a user is in.

## Feature Modules

These modules are for the other spicy and fun experiences IC Hack provides during the day. This may be features like collecting demographics or awarding points for interacting with sponsors.

Currently, there are no feature modules. Awaiting **17th April 2024** to get the first draft of extra features from DoCSoc seniors.

To create a feature module, make sure you have an `[feat]/index.ts` file with the Hono routes. See other modules for reference. Import those routes into `src/index.ts` and route them in the app.