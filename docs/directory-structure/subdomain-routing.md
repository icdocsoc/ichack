# Subdomain Routing 

::: info
This was deprecated by [PR#163](https://github.com/icdocsoc/ichack/pull/163)
:::

The application runs in the Server-side rendering (SSR) mode. This means the HTML document is rendered on the server, and sent to the browser. The JavaScript files soon follow along and the JavaScript code then renders it again on the client side, giving the page the interactivity. 

In the server side, when the requrest comes to render a page, a middleware is executed, more specifically `./server/middleware/subdomain.ts`. In this middleware, we analyse the hostname and extract the subdomain from it. The subdomain is then attached to the `ssrContext`, which is sent to the browser as a payload. Now that the middleware is executed and we have have the subdomain used (undefined if no subdomain was used), Nitro now understands that it isn't an API route, it is a page route. The handler is given to Nuxt to render the initial HTML render of the page.

When Nuxt is given the control from Nitro, it is intercepted by `app/router.options.ts` that returns a modified list of routes. This uses the subdomain to filter and map the existing list of routes. Nuxt finds the component function to render the page in the modified list of routes to render the page. In more detail, the `router.options.ts` has the payload from the server in the `ssrContext`. This also protects from any cross-domain access.