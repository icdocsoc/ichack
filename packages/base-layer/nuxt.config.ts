// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  runtimeConfig: {
    proxyUrl: process.env.SERVER_BASE_URL
  }
});
