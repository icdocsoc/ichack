import { fileURLToPath } from 'url';

export default defineNuxtConfig({
  css: ['@ui25/assets/css/base.css'],
  future: {
    compatibilityVersion: 4
  },
  alias: {
    '@ui25': fileURLToPath(new URL('.', import.meta.url))
  },

  modules: ['@nuxt/fonts', '@nuxtjs/tailwindcss'],
  fonts: {
    families: [
      {
        name: 'Archivo',
        provider: 'google',
        weights: ['100', '200', '300', '400', '500', '600', '700', '800', '900']
      },
      { name: 'IC Hack', provider: 'local', weights: ['400'] },
      { name: 'Gohu', provider: 'local', weights: ['500', '700'] }
    ]
  },

  tailwindcss: {
    cssPath: '@ui25/assets/css/tailwind.css',
    configPath: '@ui25/tailwind.config.ts'
  }
});
