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
- PostreSQL v16.3

> [!note]
> You may install the latest versions of these in the future but they may not run the project as expected. If that is the case, try installing these specific versions if you want it to run.

> [!important]
> If you use windows, please try working on WSL2 since our codebase works best inside a Unix/Linux environment.

## How to run?

### Environment Variables
You would need to set [[Environment Variables]] for the containers to spin up properly. Where a directory has a `.env.template` file, you should copy it  as `.env` and fill in the values with the correct information.

### Development 
In the root directory of the project, execute:
```bash
bun run dev
```

### Production
To view how the code would look in production, execute:
```bash
bun run preview
```

Refer to [[Docker]] to learn about how we containerised it and used compose.