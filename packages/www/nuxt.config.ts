export default defineNuxtConfig({
  $development: {
    runtimeConfig: {
      public: {
        physicsUrlPrefix: '/_nuxt/public/physics/'
      }
    }
  },

  $production: {
    runtimeConfig: {
      public: {
        physicsUrlPrefix: '/physics/'
      }
    }
  },

  extends: ['../ui25'],
  compatibilityDate: '2024-12-13',
  future: {
    compatibilityVersion: 4
  },
  modules: ['@nuxtjs/seo'],
  site: {
    url: 'ichack.org',
    indexable: false // TODO: set to true when ready for production
  },
  app: {
    head: {
      titleTemplate: '%s'
    }
  }
});
