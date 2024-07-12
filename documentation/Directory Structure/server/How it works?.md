---
created: 2024-07-08
authors:
  - Nishant
---
The server's entry point is `src/index.ts`. The server is a (in gradle project terms) a multi-modular build. See [[Modules]] to learn how they are the foundational building blocks of the server.

## Middlewares

It goes through multiple middlewares to make sure that the request to safe to process it. It includes defining CORS (although now unnecessary) and CSRF Protection (again also now unnecessary) and makes sure that the Origin matches that of an allowed host (again unnecessary) before it goes into the actual requests.

The reason why it feels unnecessary at the time of writing is because we are completely hiding the server from the outside world. See [[External Overview.excalidraw]] and [[Version 1|System Architecture v1]]. It may be handy to prevent from attacks, or a pain when trying to make basic legit requests. Something to discover later.

## Our level Security

However, we need to make sure that users still can't forge any request somehow and get unauthorised data. We have multiple roles for a user and that should determine which API Endpoint they have access to execute. This can be done easily by a permission matrix where the user role and the requested url path determines a boolean value, whether or not the request is free to proceed execution, or return a 403 Forbidden error. **_See [[Access Map]]_**