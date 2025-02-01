import type { Config } from 'tailwindcss';

export default {
  content: [],
  theme: {
    extend: {
      colors: {
        'darkblue-ic': '#2d4061',
        'blue-ic': '#0060E6',
        'red-ic': '#D62D3B',
        'yellow-ic': '#FBB03B',
        'cream-ic': '#F2F2F2',
        'gold-ic': '#BD9F51',
        'silver-ic': '#C8C6C3',
        'bronze-ic': '#B78B70'
      },
      fontFamily: {
        archivo: ['Archivo', 'sans-serif'],
        ichack: ['IC Hack', 'sans-serif'],
        gohu: ['Gohu', 'monospace'],
        lores: ['Lores', 'monospace']
      }
    }
  },
  plugins: []
} satisfies Config;
