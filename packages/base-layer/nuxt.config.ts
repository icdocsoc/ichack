import { fileURLToPath } from 'url';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  $development: {
    runtimeConfig: {
      serverBaseUrl: 'http://server_dev:3000'
    }
  },

  runtimeConfig: {
    serverBaseUrl: 'http://server:3000'
  },

  alias: {
    '@shared': fileURLToPath(new URL('../../shared', import.meta.url)),
    '@base': fileURLToPath(new URL('.', import.meta.url))
  },

  compatibilityDate: '2024-08-09'
});
