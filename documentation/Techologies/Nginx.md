---
created: 2024-07-05
authors:
 - Nishant
---
[Nginx](https://nginx.org) is again a [[Reverse Proxy]] but used for a different reason. (Nishant also used [this](https://chatgpt.com) to learn nginx)

Nginx will live in the [[Cloud VM]] alongside the monorepo. It's job is to simply redirect the traffic to the correct port based on the incoming subdomains and also help with the TLS/SSL encryption certificate.