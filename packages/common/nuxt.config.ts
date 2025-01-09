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

  $development: {
    runtimeConfig: {
      public: {
        apiBaseUrl: 'http://localhost:3000/api'
      }
    }
  },
  $production: {
    runtimeConfig: {
      public: {
        apiBaseUrl: 'https://my.ichack.org/api'
      }
    }
  }
});
