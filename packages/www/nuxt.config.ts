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
  compatibilityDate: '2024-12-13'
});
