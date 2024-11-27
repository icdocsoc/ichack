# IC Hack '25

Every application or package built to support IC Hack'25 tech.

## What is in this?

- [Server (Perry)](./server/) - First time custom backend server built.
- [Admin (Ferb)](./app) - An insider website that manages users, teams, announcements... admin stuff - tbd to be app/pages/admin or something. update before merge.

## Before you start

1. You must read this README in full.
1. Read relevant portions of the documentation.

> [!note]
> All ichack related systems every year are **private**. Feel free to fork this repository but keep it private. You could make your repo public after IC Hack is over, but make sure there are no senstive information in the repository.

## Documentation

This is the first time IC Hack tech systems will have extensive documentation. Open [the docs folder](./documentation/) as an [Obsidian Vault](https://obsidian.md).

> [!important]
> The documentation started authoring from 4th July 2024. The contributors will try to document this code as much as possible and encourage the future volunteers to do so as well. However, it may not be the case that everything is documented perfectly.
>
> As a result, some or most of the pages here will be incomplete. Over time, we will do our best that it does not happen.
>
> The tense used in the documentation will be confusing depending on the date it was written and the event that was spoken about.

## How to run?

### Pre-setup

You'll need Docker, bun, and psql installed.

### Environment Variables

Without setting environment variables, your code will not execute or behave correctly. Copy the `.env.template` file into `.env.local` and `.env.test` and fill it appriorately.

#### Dev setup

```env
PGUSER=admin
PGPASSWORD=rootpasswd
PGDB=postgres
PGHOST=0.0.0.0
PGPORT=5432

DISCORD_CLIENT_ID=anything, you'll know if you're testing this
DISCORD_SERVER_ID=see above
DISCORD_CLIENT_SECRET=see above
```

#### Test setup

```env
PGUSER=test
PGPASSWORD=test
PGDB=postgres
PGHOST=0.0.0.0
PGPORT=5432
PGCA=

DISCORD_CLIENT_ID=
DISCORD_SERVER_ID=
DISCORD_CLIENT_SECRET=
```

### Docker Compose

> [!important]
> If you use windows, please try working on WSL2 since our codebase works best inside a Unix/Linux environment.

In the root directory of the project, execute:

```bash
bun install
bun reset-db
bun run dev
```

You can visit the admin page at `localhost:3000`. This will be updated to `admin.localhost:3000` soon:tm:.

The api routes can be accessed from `localhost:3000/api`, as expected.

To stop the containers from running, simply use CTRL+C.

To add yourself as a god user for testing, edit and execute `bun run scripts/seed.ts`.

If you ran the project headless, execute (in the same root directory)

```bash
docker compose down
```

Refer to [Docker](./documentation/Techologies/Docker.md) to learn about how we containerised it and used compose.

#### Common Docker error

If you get the error

```
Error response from daemon: network 91cc91888ed27849c518f6769cf18115ddb56b0ef833e745e764964a6a2586da not found
```

Run the following command and try again.

```bash
docker-compose -f dev.docker-compose.yaml down --remove-orphans
```

## Development rules

### Working on issues

We use ClickUp to keep track of the progress of the project. To pick up an issue:

1. Assign yourself in any card from the "Backlog". This should automatically put your card under "Pending".
1. Alternatively, create an issue and add yourself as the asignee and place it in the "Pending" list.
1. Then [create a branch](#creating-a-branch) and [open a draft pr](#creating-a-pr).
1. Once the PR is approved and merged, move the card to "Completed".

### Creating a branch

No person can directly on the main branch. Hence you need to create a new branch to introduce any changes to the codebase.

1. Create your branch name following the pattern "[type]/[short-description]" where type can be either of _feat, fix, refactor, ci, chore_, etc.
1. Individual works in the short description must be separated by hyphens.

### Creating a PR

You should create a PR **as soon as** you create a branch.

1. If the PR is not ready, create a _Draft_ PR. This is so that others know what is being worked on and can provide some feedback before you are knee deep into the feature.
1. The actual commit messages within your PR **does not follow** any conventional naming pattern. However, your PR title must follow `type: description` format, similar to your branch name.
1. If any of the repo admins approve your PR and you need to need to update your branch, consider rebase to avoid making another commit for the admins to review again.

#### PR <--> ClickUp Integration

1. When you create a comment, in the description include the following text: `Link CU-86bzr6uwe`, you will find your taskId in the ClickUp Card you are working.
1. You can use special commit messages to change the status of your card. E.g. a commit message can be, `updated the readme #86bzr6uwe[in review]`.
   1. Use `#<taskId>[in progress]` to move your card into "In Progress".
   1. Use `#<taskId>[in review]` to move your card into "In Review".
   1. Use `#<taskId>[blocked]` to move your card into "Blocked".
1. When merging, your commit description should include `#<taskId>[completed]` to move your card into "Completed".

## Repository Administrators

- [@cybercoder-naj | Nishant Aanjaney Jalan](https://github.com/cybercoder-naj)
- [@dropheart | Jay Abussaud](https://github.com/dropheart)

## Code contributors

- [@Harini-Sritharar](https://github.com/Harini-Sritharar)

## License

[MIT](./LICENSE.txt)
