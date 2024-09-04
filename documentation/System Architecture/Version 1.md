---
created: 2024-07-08
authors:
  - Nishant
---
When the user requests for a website. The request first goes through [[Cloudflare]] and the potentially malicious ones are filtered out. Then the request goes to the Cloud VM where it is first encountered by [[Nginx]] which would act as a load balancer and direct the request to the correct container based on the [subdomain](#subdomains).

## Subdomains

We have subdomains for all the user-facing applications. 
- my.ichack.org -> internal
- admin.ichack.org -> admin
- ichack.org -> landing-page

api.ichack.org does not seem like a needed subdomain since the outside world will never interact with it. It is only the [[Nuxt]] servers in the [[Cloud VM]] that interact with the API.