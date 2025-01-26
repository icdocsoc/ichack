---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'IC Hack Documentation'
  tagline: Europe's Largest student-led hackathon
  image:
    src: /logo.svg
    alt: IC Hack Documentation
  actions:
    - theme: brand
      text: Getting Started
      link: /getting-started

features:
  - title: Frontend in Nuxt 4
    details: Nuxt 4 is a Vue-based meta-framework.
    icon: 
      src: https://nuxt.com/icon.png
  - title: Backend in Hono
    details: Hono is a modern library for building REST servers.
    icon: 
      src: https://hono.dev/images/logo-small.png
  - title: Monorepo with all the tools needed
    details: Includes the landing page, internal page, admin page, backend server.
    icon: 🔧
---

<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://www.github.com/cybercoder-naj.png',
    name: 'Nishant Aanjaney Jalan',
    title: "DoCSoc Webmaster 24-25",
    links: [
      { icon: 'github', link: 'https://github.com/cybercoder-naj' },
      { icon: 'linkedin', link: 'https://linkedin.com/in/nishant-a-jalan' }
    ]
  },
  {
    avatar: 'https://www.github.com/Dropheart.png',
    name: 'Jay Ahmed Abussaud',
    title: "DoCSoc Webmaster 24-25",
    links: [
      { icon: 'github', link: 'https://github.com/Dropheart' },
    ]
  },
  {
    avatar: 'https://github.com/Harini-Sritharar.png',
    name: 'Harini Sritharar',
    title: "IC Hack '25 Volunteer",
    links: [
      { icon: 'github', link: 'https://github.com/Harini-Sritharar' },
    ]
  },
  {
    avatar: 'https://github.com/JoshXL23.png',
    name: 'Joshua Gonsalves',
    title: "IC Hack '25 Volunteer",
    links: [
      { icon: 'github', link: 'https://github.com/JoshXL23' },
    ]
  },
  {
    avatar: 'https://github.com/georgedecesare.png',
    name: 'George Decesare',
    title: "IC Hack '25 Volunteer",
    links: [
      { icon: 'github', link: 'https://github.com/georgedecesare' },
    ]
  },
]
</script>

## Team 24-25

<VPTeamMembers :members="members" />