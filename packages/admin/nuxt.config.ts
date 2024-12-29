export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  extends: ['../common'],

  future: {
    compatibilityVersion: 4
  },
  icon: {
    provider: 'iconify'
  }
});
