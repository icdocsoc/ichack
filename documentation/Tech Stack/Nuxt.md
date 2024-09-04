---
created: 2024-07-05
authors:
 - Nishant
---
Follow the [Nuxt](https://nuxt.com) documentation [here](https://nuxt.com/docs/getting-started/introduction). 

Nuxt is a great Vue-based meta-framework to build full stack applications. It comes with a built-in [Nitro server](https://nitro.unjs.io/) (which we largely ignore because of the lack of features and poor documentation, we use Hono instead). Nuxt's documentation, however, was good and now it's even better; so have a thorough read of it (including some complex stuff like [Layers](https://nuxt.com/docs/getting-started/layers) and [configuration](https://nuxt.com/docs/api/nuxt-config)). Here, we are going to touch upon rendering modes:

## Rendering Modes we use with Nuxt.

### Server-side rendering (SSR)
The internal tool and the admin page uses Server-side rendering. When the user visits our website at `https://my.ichack.org`, they are making a `GET /` request with `HTTP vX.X` protocol on the `Host: my.ichack.org` and this request is encrypted under SSL (with the prime number thingy and TLS handshake....). So when the request is made, it first goes to [[Cloudflare]] and then [[Nginx]] and then comes to our docker containers running the server. The server runs some JavaScript and builds the initial HTML and CSS page and sends them to the browser. The User is shown the first initial rendering of the page.

The page isn't interactive yet though. Once the rendered HTML/CSS and the JavaScript files are sent over, the JavaScript then binds itself to the elements to make it interactive - this part is called **(client side) hydration**. 

> [!warning]
> If you ever see an error like *"Hydration mismatch"* on your console, **DO NOT IGNORE IT AND AIM TO FIX IT ASAP!!**

Hence, it is important to know what runs on the client and what runs on the server and what runs on both. The documentation does not do a very good job at this, but feel free to ask Nishant or Jay and they can explain it.

### Static Site Generation (SSG)
SSG is used for the landing page. This page is not dynamic in nature, it is quite static except for the event schedule that may change. In this mode, during deployment, all of the Nuxt code is built and prerendered into HTML, CSS, and JavaScript files. These are static so when the user visits the website at `https://ichack.org`, then they will get the files statically. Everything is done on the browser. 

## Why Nuxt 3?

Nishant and Jay worked with Nuxt 3 for IC Hack '24 and this made total sense to continue it for IC Hack '25. Considering how we decide to build our systems, it will be great if future years also use Nuxt (probably v4 or v5). But our codebase will be structured as such that using Nuxt will not be mandatory. 

## Why not Nuxt 4?

Nuxt 4 is practically out at this time of writing. However, it is in beta build right now and we don't wish to experiment, especially since we were experimenting with the backend (See [[Why do this]]). Additionally, Nuxt 4 is not very different than Nuxt 3, apart from a few breaking changes. So it doesn't matter much anyway.

## Bad things about Nuxt.
- Forced to use a server - Unlike Nextjs or Vue or Svelte etc, Nuxt is a **full-stack framework**, not a frontend framework. Nuxt server uses [Nitro](https://nitro.unjs.io/) server as it's backend (which is a wrapper around [h3](https://h3.unjs.io/)). Nuxt comes forced with this so we have to proxy this to our own backend.
	- So why not use Nitro to build the backend? Because Nitro's documentation is poor.
	- How to solve this issue? See [[Version 1|System Architecture v1]].

## So why not Vue?
- Although the server part is an issue which makes the codebase slightly less easier to comprehend. Nuxt still has great out-of-the-box features and zero-config philosophy. When it comes to using Vue, we'd have to customise our own routing, and maintain the directory structure ourselves. Nuxt does it all under the hood. 