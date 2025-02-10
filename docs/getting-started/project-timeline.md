---
order: 1
---

# Project Timeline

## First Architecture

The initial development started in **July 2024** with the Hono server. Minor refactorings took place during this time but it was confined to the server. The initial vision was to rent a [Digital Ocean Droplet](../technologies/digital-ocean) and deploy the system there. The project had 3 applications with 2 layers and the server. Thereby creating 4 docker images talking to on another inside a Docker Network.

## Second Architecture

Around **November 2024**, the codebase was completely refactored ([PR#43](https://github.com/icdocsoc/ichack/pull/43)) to support the [serverless architecture](../concepts/serverless-computing) of [Digital Ocean App Platform](../technologies/digital-ocean). The first architecture was a bit of a pain configuring the environment variables and on-boarding new users. This simplified the repository greatly and easier to deploy and manage.

As a result, we end up with the `website` application that is a single Nuxt4 application. This was connected to the Hono server with the `serverHandlers` property of `NuxtConfig`. The application smartly filtered pages and re-routed requests from `admin.ichack.org` and `my.ichack.org` accordingly from server middlewares and custom page routing defined in `apps/router.options.ts`.

The other application was `landing` that existed as a layer. We leveraged the fact that a Nuxt layer can be a stand-alone application. This app was statically generated and the files were uploaded to [Cloudflare Pages](../technologies/cloudflare) via [GitHub Actions](../technologies/github-actions).

`admin` and `my` remained as layers connected to the parent application for separation concerns. These layers extended `common` for the API requests they perform and `ui25` for the common UI components. As earlier, `admin` used [Nuxt UI v2](../technologies/nuxt-ui) and continued to do so.

Soon, we realised we were building something great and massive. We renamed the repository from ichack25 to simply ichack ([PR#54](https://github.com/icdocsoc/ichack/pull/54)) for future years to build upon this for many years to come. :tada:

### Nuxt 3 --> Nuxt 4

We decided to migrate the application to use Nuxt 4 instead. It was a bit of a migration to do so. This resulted a change in the Directory Structure.

### No more Nginx

The repository is one single giant Nuxt application. The division of the applications by subdomains is handled by the [subdomain router](../directory-structure/subdomain-routing).

### Docker simplified

We replaced two compose files with just one. The docker compose file shows the production level build, while a dev build is spawned with the `start-dev.sh` script.

## Third Architecture

During the development, Joshua (IC Hack '25 volunteer) raised an issue about **10th January 2025** that the cookie headers were sent by the server but were no longer set by the browser. Nishant investigated to find that it was because of [third-party cookies](../concepts/third-party-cookies). A fix was attempted ([PR#162](https://github.com/icdocsoc/ichack/pull/162)) but it did not work. Therefore, after some discussions, we decided to shift `admin.ichack.org` to `my.ichack.org/admin`. The server host url would also remain at `my.ichack.org` to avoid the whole problem entirely ([PR#163](https://github.com/icdocsoc/ichack/pull/163)).

This was a simple fix, there were no changes to the directory structure except for a couple folder renaming.
