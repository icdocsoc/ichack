---
created: 2024-07-30
authors:
  - Jay
---
Most the code is either commented or simple. 

One thing to point out is that in the code (such as `Event_t`), dates must be strings. This is because JSON does not have Date objects, and so in web requests all dates will be passed as strings & parsed by Drizzle (hence the `{mode: 'string'}` in the schema).

`Event_t` also has `id` as optional, so it can be used for both the JSON return type that has the ID, and the POST JSON that does not have the ID. This shouldn't really matter, as the type is only for the test file.

While writing tests, I also found something annoying that I'll document just in case. 
```ts
    const res = await testClient(app).event.$get(
      {
        headers: {
          Cookie: `auth_session=${sessionIds.hacker}`
        }
      }
    );
```
This does not work.
```ts
    const res = await testClient(app).event.$get(
      undefined,
      {
        headers: {
          Cookie: `auth_session=${sessionIds.hacker}`
        }
      }
    );

```
This does.
(all requests, including get, take a body as the first parameter.)