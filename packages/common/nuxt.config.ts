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
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL
    }
  }
});
