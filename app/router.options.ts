import type { RouterOptions } from 'nuxt/schema';

export default <RouterOptions>{
  routes(_routes) {
    const { ssrContext } = useNuxtApp();
    let subdomain = '';

    if (import.meta.server)
      subdomain = ssrContext?.event.context.subdomain ?? 'www';
    else {
      const { host } = useRequestURL();
      const config = useRuntimeConfig();
      if (!config.public.mainDomain.includes(host))
        subdomain = host.match(/^[^.]*/g)?.[0] ?? 'www';
      else subdomain = 'www';
    }

    const subdomainRoutes = _routes
      .filter(({ path }) => path.startsWith(`/$${subdomain}`))
      .map(({ path, ...rest }) => ({
        ...rest,
        path: path.replace(`/$${subdomain}`, '')
      }));
    return subdomainRoutes;
  }
};
