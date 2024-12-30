export default defineNuxtConfig({
  $development: {
    runtimeConfig: {
      public: {
        physicsUrlPrefix: '/_nuxt/public/physics'
      }
    }
  },

  $production: {
    runtimeConfig: {
      public: {
        physicsUrlPrefix: '/physics'
      }
    }
  },

  app: {
    rootAttrs: {
      id: 'app',
      style: 'overflow-x: hidden;'
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
  },
});
