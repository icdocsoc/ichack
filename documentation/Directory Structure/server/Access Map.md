---
created: 2024-07-13
authors:
  - Nishant
---
We have multiple roles for all users of IC Hack:
- admin
- judge
- volunteer
- hacker
- sponsor

`AccessPermission` is a type that has all the above types + "public" (for anyone, even unauthenticated) + "authenticated" (for anyone who is authenticated). 

The Access Map is a simple mapping of `(method, url) -> (role[] | public | authenticated`. There is a middleware which checks if the incoming request has sufficient permissions to access the route.

1. If the list of roles has `public`, then it renders other roles unreachable.
2. Next in line is the `authenticated`, other roles in the map are rendered unreachable.
3. Then it checks individually if the authenticated user with the certain role has access to see the content. 