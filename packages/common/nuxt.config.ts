import { fileURLToPath } from 'bun';

export default defineNuxtConfig({
  alias: {
    '@common': fileURLToPath(new URL('.', import.meta.url))
  },

  imports: {
    dirs: ['stores']
  },

  modules: ['@pinia/nuxt']
});
