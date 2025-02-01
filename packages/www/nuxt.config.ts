export default defineNuxtConfig({
  css: ['@/assets/css/global.css'],
  app: {
    rootAttrs: {
      id: 'app'
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
    },
    '/onboarding': {
      redirect: {
        to: 'https://docs.google.com/document/d/1AQVJObyH_-aUKdx4p9MP1atXwxqjn03aW-P0T4GPe0g/edit',
        statusCode: 301
      }
    }
  },

  tailwindcss: {
    config: {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Archivo', 'sans-serif']
          }
        }
      }
    }
  }
});
