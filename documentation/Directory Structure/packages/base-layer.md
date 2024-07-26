---
created: 2024-07-08
authors:
  - Nishant
---
The base layer is a [Nuxt layer](https://nuxt.com/docs/getting-started/layers) which contains the some of the base components and configuration that every Nuxt application should have.

The base layer currently:
- Forces all `/api/*` routes to be transformed into `http://api.example.org:3000/*` routes.
	- For instance `POST /api/users/create` is proxied to `POST http://api.example.org:3000/users/create`.