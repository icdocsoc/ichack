export default defineNuxtConfig({
  $development: {
    runtimeConfig: {
      public: {
        publicUrlPrefix: '/_nuxt/public'
      }
    }
  },

  $production: {
    runtimeConfig: {
      public: {
        publicUrlPrefix: ''
      }
    }
  },

  app: {
    rootAttrs: {
      id: 'app',
      style:
        'overflow-x: hidden; min-height: 100svh; background: black; color: white;'
    },
    head: {
      titleTemplate: '%s'
    }
  },

  modules: ['@vueuse/nuxt', '@nuxtjs/seo'],

  extends: ['../ui25', '../common'],
  compatibilityDate: '2024-12-13',
  future: {
    compatibilityVersion: 4
  },
  site: {
    url: 'ichack.org',
    indexable: true
  },
  routeRules: {
    '/code-of-conduct': {
      redirect: {
        to: 'https://docs.google.com/document/d/15j6irKFiP-i9cfbk37RxYaBpgsenMjG0t9kM_uyKIDo/edit?usp=sharing',
        statusCode: 301
      }
    },
    '/privacy-policy': {
      redirect: {
        to: 'https://docs.google.com/document/d/1mry0UjbjJE6ODatHnSlY8fei7peSl4ac/edit',
        statusCode: 301
      }
    }
  }
});
