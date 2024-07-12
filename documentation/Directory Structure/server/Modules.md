---
created: 2024-07-13
authors:
  - Nishant
---
Every sub-directory inside the `server/` directory is considered a **module**. A module is nothing but some mini-code that is part of the project. 

Each module in the server introduces 3 things:
1. The new routes.
2. The [[Access Map]] for those routes.
3. Any related schemas (optional).

> [!note]
> This is not any universal rule that a server module needs these three things. Those 3 items are required for our server, so every new module will require those fields.

These modules are *pluggable* in the server code. In `src/index.ts`, you can import the module and install it via the `installModule(Hono, Module)` function. 

### `installModule` function

A fairly straightforward function: It will make sure that every route you declared has an associated access permission, it will install the middleware to check for this permission before routing the code. 

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

To create a feature module, make sure you have an `[feat]/index.ts` file that exports a `Module` interface as default. See other modules for reference. At the end, install the module in the entrypoint, `src/index.ts`.