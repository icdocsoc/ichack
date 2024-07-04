---
title: Subdomains
date: 2024-07-05
---
We have subdomains for all the user-facing applications. 
- my.ichack.org -> internal
- admin.ichack.org -> admin
- ichack.org -> landing-page

api.ichack.org does not seem like a needed operation since the outside world will never interact with it. It is only the [[Nuxt]] servers in the [[Cloud VM]] that interact with the API.