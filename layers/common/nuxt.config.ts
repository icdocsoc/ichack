import { fileURLToPath } from 'bun';

export default defineNuxtConfig({
  css: ['@common/assets/css/base.css'],

  alias: {
    '@common': fileURLToPath(new URL('.', import.meta.url))
  },

  imports: {
    dirs: ['stores']
  },

  modules: ['@pinia/nuxt']
});
