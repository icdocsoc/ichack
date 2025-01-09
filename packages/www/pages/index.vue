<template>
  <ICNavBar :links="navBarLinks" />

  <main>
    <SectionJumbotron class="pb-10" />
    <SectionCountdown class="py-8" />
    <DividerOne />
    <SectionAbout class="py-16" />
    <SectionTicket class="py-16" />
    <SectionSponsors class="py-16" />
    <SectionTeam class="py-16" />
    <SectionFAQ class="py-16" />
  </main>

  <ICFooter />
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const urlPrefix = config.public.publicUrlPrefix + '/og';

const navBarLinks = [
  {
    label: 'About',
    to: '#about'
  },
  {
    label: 'Tickets',
    to: '#tickets'
  },
  {
    label: 'Sponsors',
    to: '#sponsors'
  },
  {
    label: 'Team',
    to: '#team'
  },
  {
    label: 'FAQ',
    to: '#faq'
  }
];

useSeoMeta({
  title: "IC Hack '25",
  description:
    "Europe's largest student-run hackathon at Imperial College London",
  applicationName: "IC Hack '25",

  ogTitle: "IC Hack '25",
  ogSiteName: "IC Hack '25",
  ogDescription:
    "Europe's largest student-run hackathon at Imperial College London",
  ogUrl: 'https://ichack.org',
  ogType: 'website',
  ogImage: `${urlPrefix}/regular.png`,

  twitterCard: 'summary_large_image',
  twitterTitle: "IC Hack '25",
  twitterDescription:
    "Europe's largest student-run hackathon at Imperial College London",
  twitterImage: `${urlPrefix}/twitter.png`
});
</script>
