import { fileURLToPath } from 'url';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  runtimeConfig: {
    proxyUrl: process.env.SERVER_BASE_URL
  },

  alias: {
    '@shared': fileURLToPath(new URL('../../shared', import.meta.url)),
    '@base': fileURLToPath(new URL('.', import.meta.url))
  },

  compatibilityDate: '2024-08-09'
});
