---
title: Nuxt
date: 2024-07-05
---
Follow the [Nuxt](https://nuxt.com) documentation [here](https://nuxt.com/docs/getting-started/introduction). 

## Why Nuxt 3?

Nishant and Jay worked with Nuxt 3 for IC Hack '24 and this made total sense to continue it for IC Hack '25. Considering how we decide to build our systems, it will be great if future years also use Nuxt (probably v4 or v5). But our codebase will be structured as such that using Nuxt will not be mandatory. 

## Why not Nuxt 4?

Nuxt 4 is practically out at this time of writing. However, it is in beta build right now and we don't wish to experiment, especially since we were experimenting with the backend (See [[Why do this?]]). Additionally, Nuxt 4 is not very different than Nuxt 3, apart from a few breaking changes. So it doesn't matter much anyway.

## Bad things about Nuxt.

- Poor Documentation - although the framework is great, the documentation sucks (at time of writing). Nishant has reported it constantly on Reddit and on LinkedIn to the Nuxt team, but at the time of writing, the beginner stuff is well documented; but not the advance stuff. 
- Forced to use a server - Unlike Nextjs or Vue or Svelte etc, Nuxt is a **full-stack framework**, not a frontend framework. Nuxt server uses [Nitro](https://nitro.unjs.io/) server as it's backend (which is a wrapper around [h3](https://h3.unjs.io/)). Nuxt comes forced with this so we have to proxy this to our own backend.
	- So why not use Nitro to build the backend? Because Nitro's documentation is poor.
	- How to solve this issue? See [[System Architecture]].

## So why not Vue?

- Although the server part is an issue which makes the codebase slightly less easier to comprehend. Nuxt still has great out-of-the-box features and zero-config philosophy. When it comes to using Vue, we'd have to customise our own routing, and maintain the directory structure ourselves. Nuxt does it all under the hood. 