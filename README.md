# IC Hack

Every application or package built to support IC Hack tech.

## What is in this?

This is a gigantic single running Nuxt4 application. The 3 main frontend applications are separated under subdomain routing.

- [Server (Perry)](./server/) - Backend server written in Hono.
- [Admin (Ferb)](./packages/admin/) - The admin dashboard website that manages users, teams, announcements.
- [Internal (Phineas)](./app/) - The Internal Website used by hackers, volunteers, etc.
- [Landing Page (Isabella)](./packages/www/) - The static landing page.

This application also contains the utility modules:

- [Common](./packages/common/) - Common utilities and API call code.
- [UI 25](./packages/ui25/) - The UI components for IC Hack '25.

## Before you start

1. You must read this README in full.
1. Read relevant portions of the documentation.

> [!note]
> All IC Hack related systems every year are **private**. A public **port** (not _fork_) of the repository is allowed but all sensitive information must be deleted from all commit history.

## Documentation

This is the first time IC Hack tech systems will have extensive documentation. Execute `bun docs:dev` to view the documentation. You can also view the API Reference for the server by running `bunx serve scalar`.

> [!important]
> The documentation started authoring from 4th July 2024. The contributors will try to document this code as much as possible and encourage the future volunteers to do so as well. However, it may not be the case that everything is documented perfectly.
>
> As a result, some or most of the pages here will be incomplete. Over time, we will do our best that it does not happen.
>
> The tense used in the documentation will be confusing depending on the date it was written and the event that was spoken about.

## Development rules

### Creating a branch

No person can directly on the main branch. Hence you need to create a new branch to introduce any changes to the codebase.

1. Create your branch name following the pattern "[type]/[short-description]" where type can be either of _feat, fix, refactor, ci, chore_, etc.
1. Individual works in the short description must be separated by hyphens.

### Creating a PR

You should create a PR **as soon as** you create a branch.

1. If the PR is not ready, create a _Draft_ PR. This is so that others know what is being worked on and can provide some feedback before you are knee deep into the feature.
1. The actual commit messages within your PR **does not follow** any conventional naming pattern. However, your PR title must follow `type(scope): description` format, similar to your branch name.
1. If any of the repo admins approve your PR and you need to need to update your branch, consider rebase to avoid making another commit for the admins to review again.

## Our Team

### IC Hack '25

#### Repository Administrators

- [@cybercoder-naj | Nishant Aanjaney Jalan](https://github.com/cybercoder-naj)
- [@dropheart | Jay Abussaud](https://github.com/dropheart)

#### Code contributors

- [@Harini-Sritharar](https://github.com/Harini-Sritharar)
- [@JoshXL23 | Joshua Gonsalves](https://github.com/JoshXL23)
- [@georgedecesare](https://github.com/georgedecesare)

#### Additional Credits

- [@Who23 | Aditya Shrivastava](https://github.com/Who23) for registration scripts and users admin page
- [@Saim-Khan1](https://github.com/Saim-Khan1) for implementing "Add to Google/Apple wallet" feature
- [@invisi-splat | Bowen Zhu](https://github.com/invisi-splat) for working on hackspaces code.

## License

[MIT](./LICENSE.txt)
