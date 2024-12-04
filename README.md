# IC Hack

Every application or package built to support IC Hack tech.

## What is in this?

This is a gigantic single running Nuxt4 application. The 3 main frontend applications are separated under subdomain routing.

- [Server (Perry)](./server/) - First time custom backend server built.
- [Admin (Ferb)](./app/pages/$admin/) - An admin dashboard website that manages users, teams, announcements.
- [Internal (Phineas)](./app/pages/$my/) - The Internal Website used by hackers, volunteers, etc.
- [Landing Page (Isabella)](./app/pages/$www/) - A static landing page.

## Before you start

1. You must read this README in full.
1. Read relevant portions of the documentation.

> [!note]
> All IC Hack related systems every year are **private**. A public **port** (not _fork_) of the repository is allowed but all sensitive information must be deleted from all commit history.

## Documentation

This is the first time IC Hack tech systems will have extensive documentation. Open [the docs folder](./documentation/) as an [Obsidian Vault](https://obsidian.md).

1. Install [Obsidian](https://obsidian.md/).
2. Open the path `./documentation` as an Obsidian Vault.

> [!important]
> The documentation started authoring from 4th July 2024. The contributors will try to document this code as much as possible and encourage the future volunteers to do so as well. However, it may not be the case that everything is documented perfectly.
>
> As a result, some or most of the pages here will be incomplete. Over time, we will do our best that it does not happen.
>
> The tense used in the documentation will be confusing depending on the date it was written and the event that was spoken about.

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

#### PR <> ClickUp Integration

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
