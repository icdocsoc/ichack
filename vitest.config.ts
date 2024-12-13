import { defineVitestConfig } from '@nuxt/test-utils/config';
import { fileURLToPath } from 'url';

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        rootDir: fileURLToPath(new URL('./packages', import.meta.url)),
        domEnvironment: 'happy-dom'
      }
    }
  }
});
