# Cloudflare

Cloudflare's [website](https://cloudflare.com) 

They provide a bunch of different internet solutions to consumers. We use/plan to use
- [Reverse Proxy](../concepts/reverse-proxy).
- Web application Firewall (self-explanatory).
- Analytics (self-explanatory).
- [DNS record management](../concepts/dns).
- SSL/TLS - gives the 's' in https by decrypting incoming traffic and encrypting outgoing traffic. 
	- This also needs to be done by [Nginx](./nginx) too.
- DDoS protection - Prevents a DDoS attack by blocking the malicious requests. 

## Pages

Cloudflare also provides us a CDN free-of-cost called Cloudflare Pages. We build the application on [Github Actions](./github-actions) and upload the static files to Cloudflare pages.