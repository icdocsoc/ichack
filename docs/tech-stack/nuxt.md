# Nuxt

Follow the [Nuxt](https://nuxt.com) documentation [here](https://nuxt.com/docs/getting-started/introduction). 

Nuxt is a great Vue-based meta-framework to build full stack applications. It comes with a built-in [Nitro server](https://nitro.unjs.io/) (which we largely ignore because of the lack of features and poor documentation, we use Hono instead). Nuxt's documentation, however, was good and now it's even better; so have a thorough read of it (including some complex stuff like [Layers](https://nuxt.com/docs/getting-started/layers) and [configuration](https://nuxt.com/docs/api/nuxt-config)). 

::: warning
If you ever see an error like *"Hydration mismatch"* on your console, **DO NOT IGNORE IT AND AIM TO FIX IT ASAP!!**
:::

It is important to know what runs on the client and what runs on the server and what runs on both. Feel free to ask Nishant or Jay and they can explain it.

::: info
Nishant updated the docs on Universal Rendering in the Nuxt website. Check it out [here](https://nuxt.com/docs/guide/concepts/rendering#universal-rendering).
:::

## Why Nuxt 3?

Nishant and Jay worked with Nuxt 3 for IC Hack '24 and this made total sense to continue it for IC Hack '25. Considering how we decide to build our systems, it will be great if future years also use Nuxt (probably v4 or v5). But our codebase will be structured as such that using Nuxt will not be mandatory. 

## Why not Nuxt 4?

Nuxt 4 is practically out at this time of writing. However, it is in beta build right now and we don't wish to experiment, especially since we were experimenting with the backend. Additionally, Nuxt 4 is not very different than Nuxt 3, apart from a few breaking changes. So it doesn't matter much anyway.

::: info
With the [2nd architecture PR](../getting-started/project-timeline), we migrated to Nuxt4.
:::

## Bad things about Nuxt.
- Forced to use a server - Unlike Nextjs or Vue or Svelte etc, Nuxt is a **full-stack framework**, not a frontend framework. Nuxt server uses [Nitro](https://nitro.unjs.io/) server as it's backend (which is a wrapper around [h3](https://h3.unjs.io/)). Nuxt comes forced with this so we have to proxy this to our own backend.
	- So why not use Nitro to build the backend? Because Nitro's documentation is poor.

## So why not Vue?
- Although the server part is an issue which makes the codebase slightly less easier to comprehend. Nuxt still has great out-of-the-box features and zero-config philosophy. When it comes to using Vue, we'd have to customise our own routing, and maintain the directory structure ourselves. Nuxt does it all under the hood. 