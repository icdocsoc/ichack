// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  extends: ['../../packages/base-layer'],
  modules: ['@pinia/nuxt', '@nuxt/ui'],
  runtimeConfig: {
    public: {
      serverBaseUrl: process.env.SERVER_BASE_URL
    }
  },
  css: ['~/assets/css/base.css'],
  icon: {
    provider: 'iconify'
  }
});
