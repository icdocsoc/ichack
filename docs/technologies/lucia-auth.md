# Lucia Auth

[Lucia](https://lucia-auth.com/) is helper library to deal with authentication. Instead of manually dealing with creating auth tokens and verifying them, lucia does it for us. It is not another vendor lock-in auth like [Clerk](https://clerk.com/) or [Firebase Auth](https://firebase.google.com/docs/auth), but a somewhat smaller abstraction where it interacts with the database to make auth easier to deal with.

[The Copenhagen Book](https://thecopenhagenbook.com/) is a great reference to read on how to properly deal with multiple types of authentication methods and how to prevent yourself from common attacks.

The lucia documentation is great and especially [this example repo](https://github.com/lucia-auth/examples/tree/main/hono/username-and-password) helps in practically understanding how to use Lucia.

::: danger
Lucia v3 has announced it's deprecation [here](https://github.com/lucia-auth/lucia/discussions/1714). Please switch to Lucia v4 (if released) or use something else for IC Hack '26 onwards.
:::