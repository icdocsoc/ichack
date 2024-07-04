---
title: Directory Structure
date: 2024-07-04
---
The monorepo is a big TypeScript project with multiple projects included here.
- `apps/*` directory contains all the projects for the front-end websites.
- `packages/*` directory contains [[Nuxt]] layers and packages that make the building block of the website.
- `server` directory is a [[Hono]] application that deals with... the server.
- `nginx` directory contains the configuration file for [[Nginx]] reverse proxy.  