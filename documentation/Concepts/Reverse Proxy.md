---
created: 2024-07-08
authors:
  - Nishant
---
Reverse Proxies are a server whose job is
1. Filter out malicious requests.
2. Return cached results.
3. Get results from the origin source and then return that back.

They sit infront of a server and do all the above. It is a "middleware as a server". All requests to the server go through the reverse proxy.