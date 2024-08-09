// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  extends: ['../../packages/base-layer'],
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', '@nuxt/test-utils/module'],
  runtimeConfig: {
    public: {
      serverBaseUrl: process.env.SERVER_BASE_URL
    }
  }
});
