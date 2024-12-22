import { fileURLToPath } from 'url';

export default defineNuxtConfig({
  css: ['@ui25/assets/css/base.css'],

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
      { name: 'IC Hack', provider: 'local', weights: ['400'] }
    ]
  },

  tailwindcss: {
    cssPath: '@ui25/assets/css/tailwind.css',
    config: {
      theme: {
        extend: {
          colors: {
            'blue-ic': '#0060E6',
            'red-ic': '#ED4250',
            'yellow-ic': '#FBB03B',
            'cream-ic': '#F2F2F2'
          },
          fontFamily: {
            sans: ['Archivo', 'sans-serif'],
            archivo: ['Archivo', 'sans-serif'],
            ichack: ['IC Hack', 'sans-serif']
          }
        }
      }
    }
  }
});
