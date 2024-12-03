---
created: 2024-07-04
authors: 
 - Nishant
---
## Version 1 (Deprecated)

The monorepo is a big TypeScript project with multiple projects included here.
- `apps/*` directory contains all the projects for the front-end websites.
- `packages/*` directory contains [[Nuxt]] layers and packages that make the building block of the applications.
- `server` directory is a [[Hono]] application that deals with... the server.
- `nginx` directory contains the configuration file for [[Nginx]] reverse proxy.  

> [!note]
> This directory structure has been resigned. Check out [[The Fresh Architecture]]

## Version 2
The monorepo is a big TypeScript project with multiple projects included here.
- `app` directory contains all the projects for the front-end websites. This is achieved via [[Subdomain Routing]].
- `layers/*` directory contains [[Nuxt]] layers that make the building block of the applications.
- `server` directory is a [[Hono]] application that deals with the server.