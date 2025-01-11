import { fileURLToPath } from 'url';
import type { NuxtPage } from 'nuxt/schema';

export default defineNuxtConfig({
  extends: ['../common', '../ui25'],
  alias: {
    '@my': fileURLToPath(new URL('.', import.meta.url))
  },

  future: {
    compatibilityVersion: 4
  },

  hooks: {
    'pages:extend'(pages) {
      const pagesToRemove: NuxtPage[] = [];
      pages.forEach(page => {
        if (page.path.includes('component')) pagesToRemove.push(page);
      });

      pagesToRemove.forEach((page: NuxtPage) => {
        pages.splice(pages.indexOf(page), 1);
      });
    }
  },
  components: [
    '@my/components',
    '@ui25/components',
    {
      path: '@my/pages/$my',
      pattern: '*/components/**',
      pathPrefix: false
    }
  ]
});
