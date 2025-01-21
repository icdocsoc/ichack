import { defineConfig } from 'vitepress';
import { withSidebar } from 'vitepress-sidebar';

// https://vitepress.dev/reference/site-config
export default defineConfig(
  withSidebar(
    {
      title: 'IC Hack Documentation',
      description: "IC Hack is Europe's Largest student-led hackathon.",
      themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [{ text: 'Home', link: '/' }],

        socialLinks: [
          { icon: 'github', link: 'https://github.com/icdocsoc/ichack' }
        ],
        outline: {
          level: 'deep'
        },
        logo: '/logo.svg',
        search: {
          provider: 'local'
        },
        footer: {
          copyright: 'Copyright © 2024-present DoCSoc & IC Hack \'25 Volunteers'
        }
      },
      lastUpdated: true,
      head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
      ignoreDeadLinks: [/http:\/\/localhost:\d+(\/.*)?/]
    },
    {
      documentRootPath: '/docs',
      useTitleFromFileHeading: true,
      useFolderLinkFromIndexFile: true,
      useFolderTitleFromIndexFile: true,
      sortMenusByFrontmatterOrder: true,
      hyphenToSpace: true,
      capitalizeEachWords: true,
      manualSortFileNameByPriority: ['getting-started']
    }
  )
);
