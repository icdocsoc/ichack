---
created: 2024-07-13
authors:
  - Nishant
---
Nishant learnt from senior developers that configuring [[Nginx]] and using [[Docker]] compose is how applications in 2010 were deployment. They recommended that there would definitely be many problems if doing it for the first time. Hence, it is better to deploy it on any cloud service platform that does the load balancing and scaling for you. 

The options were Amazon Web Services (AWS), Google Cloud Platform (GCP), Digital Ocean and Heroku. 
1. AWS and GCP are complicated and intimidating. It is already a big jump to go from Firebase to building our own server.
2. Heroku tooling is bad and they seem like a weird cloud platform.
3. Digital Ocean looks nice, and seems to have good support (with the blogs and UI design). Looks beginner friendly, so gonna settle with this.

Hence, a request from the new system (as shown in [[External Overview v2.excalidraw]]) goes through [[Cloudflare]] to a [[Digital Ocean Droplet]].