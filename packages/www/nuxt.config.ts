export default defineNuxtConfig({
  $development: {
    runtimeConfig: {
      public: {
        publicUrlPrefix: '/_nuxt/public'
      }
    }
  },

  $production: {
    runtimeConfig: {
      public: {
        publicUrlPrefix: ''
      }
    }
  },

  app: {
    rootAttrs: {
      id: 'app',
      style:
        'overflow-x: hidden; min-height: 100svh; background: black; color: white;'
    },
    head: {
      titleTemplate: '%s'
    }
  },

  modules: ['@vueuse/nuxt', '@nuxtjs/seo'],

  extends: ['../ui25', '../common'],
  compatibilityDate: '2024-12-13',
  future: {
    compatibilityVersion: 4
  },
  site: {
    url: 'ichack.org',
    indexable: true
  }
});
