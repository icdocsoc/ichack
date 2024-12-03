---
created: 2024-11-30
authors:
  - Nishant
---
The old architecture was a bit of a pain configuring the environment variables and on boarding new users. More importantly, instead of the initial plan of renting a [[Cloud VM]], we instead decided to go with a [Serverless approach](https://www.cloudflare.com/learning/serverless/what-is-serverless/) that simplifies the repository greatly and easier to deploy on [[Digital Ocean]].

# Nuxt 3 --> Nuxt 4
We decided to migrate the application to use Nuxt 4 instead. It was a bit of a migration to do so. This resulted a change in the Directory Structure.

# No more Nginx
The repository is one single giant Nuxt application. The division of the applications by subdomains is handled by the [[Subdomain Routing|subdomain router]].

# Docker simplified
We replaced two compose files with just one. The docker compose file shows the production level build, while a dev build is spawned with the `start-dev.sh` script.