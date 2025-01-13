// Remove deprecated color warnings for Bun
// https://github.com/nuxt/ui/issues/809
import { createRequire } from 'node:module';
const _require = createRequire(import.meta.url);
const defaultColors = _require('tailwindcss/colors.js');
delete defaultColors.lightBlue;
delete defaultColors.warmGray;
delete defaultColors.trueGray;
delete defaultColors.coolGray;
delete defaultColors.blueGray;

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2024-11-21',

  future: {
    compatibilityVersion: 4
  },

  serverHandlers: [
    {
      route: '/api',
      handler: 'server/index.ts',
      middleware: true
    }
  ],

  extends: ['packages/admin', 'packages/common', 'packages/ui25'],

  app: {
    rootAttrs: {
      id: 'app',
      style:
        'overflow-x: hidden; min-height: 100svh; background: black; color: white;'
    },
    head: {
      titleTemplate: 'My IC Hack | %s'
    }
  }
});
