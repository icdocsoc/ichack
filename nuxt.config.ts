// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2024-11-21',

  future: {
    compatibilityVersion: 4
  },

  serverHandlers: [
    {
      route: '/api',
      handler: 'server/index.ts',
      middleware: true
    }
  ],

  $development: {
    runtimeConfig: {
      public: {
        mainDomain: ['localhost:3000']
      }
    },
    modules: ['@nuxt/test-utils/module']
  },

  $production: {
    runtimeConfig: {
      public: {
        mainDomain: ['ichack.org', 'localhost:3000']
      }
    }
  },

  extends: ['layers/admin', 'layers/my', 'layers/www']
});
