# Directory Structure

The monorepo is a big TypeScript project with multiple projects included here.

- `app` directory contains the internal website that lives on the `my.ichack.org` domain.
- `packages/*` directory contains [Nuxt](../tech-stack/nuxt) layers that make the building block of the applications.
  - `packages/admin` has the `/admin` pages and conducts all the admin related activities.
  - `packages/www` is the stand-alone landing page. The html files are statically generated at build time.
  - `packages/common` is the layer with mostly composables that make API requests.
  - `packages/ui25` contains the UI components that are common to landing page and the website.
- `server` directory is a [Hono](../tech-stack/hono) application.
