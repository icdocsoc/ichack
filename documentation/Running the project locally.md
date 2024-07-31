---
created: 2024-07-04
authors:
 - Nishant
---
## System Requirements

This is not an exhaustive list.
- [[Bun]] v1.1.17
- Node v22.2.0
- [[Docker]] v26.1.3

> [!note]
> You may install the latest versions of these in the future but they may not run the project as expected. If that is the case, try installing these specific versions if you want it to run.

> [!important]
> If you use windows, please try working on WSL2 since our codebase works best inside a Unix/Linux environment.

## How to run?
In the root directory of the project, execute:
```bash
docker compose -f dev.docker-compose.yaml up --build
```

To stop the containers from running, execute (in the same root directory)
```bash
docker compose down
```

Refer to [[Docker]] to learn about how we containerised it and used compose.