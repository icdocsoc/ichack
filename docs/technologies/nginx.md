# Nginx

[Nginx](https://nginx.org) is a [Reverse Proxy](../concepts/reverse-proxy.md). (Nishant also used [this](https://chatgpt.com) to learn nginx)

Nginx will live in the [Cloud VM](../concepts/cloud-vm) alongside the monorepo. It's job is to simply redirect the traffic to the correct port based on the incoming subdomains and also help with the TLS/SSL encryption certificate.

> [!note]
> After the [2nd architecture PR](../getting-started/project-timeline.md), this is no longer used.