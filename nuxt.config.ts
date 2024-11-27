// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2024-11-21',
  modules: ['@pinia/nuxt', '@nuxt/ui'],

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

  css: ['~/assets/css/base.css'],

  icon: {
    provider: 'iconify'
  }
});
