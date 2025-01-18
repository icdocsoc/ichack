import { fileURLToPath } from 'bun';

export default defineNuxtConfig({
  alias: {
    '@common': fileURLToPath(new URL('.', import.meta.url))
  },
  future: {
    compatibilityVersion: 4
  },
  imports: {
    dirs: ['stores']
  },

  modules: ['@pinia/nuxt'],

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_BASE_URL
    }
  }
});
