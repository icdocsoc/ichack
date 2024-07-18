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

## How to run?

In the root directory of the project, execute:

```bash
docker compose up --build
```

To stop the containers from running, execute (in the same root directory)

```bash
docker compose down
```

Refer to [[Docker]] to learn about how we containerised it and used compose.

## Developing applications with hot reload

This does not hot reload on any changes, and it is annoying to shut down and up again. I did not want to use volumes for every service to make it happen. So whenever you need hot reload, you can [start an individual service](https://stackoverflow.com/a/30234588/11292068) with docker compose and then run the developing code in dev mode.