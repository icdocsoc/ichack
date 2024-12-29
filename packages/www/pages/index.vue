<template>
  <ICNavBar :buttons="buttons" />

  <main>
    <SectionJumbotron />
    <SectionCountdown class="py-12" />
  </main>
</template>

<script setup lang="ts">
const buttons = [
  {
    title: 'About',
    to: '/'
  },
  {
    title: 'Tickets',
    to: '/'
  },
  {
    title: 'Save the date!',
    to: '/'
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
  ogImage: '/public/og/image.png',

  twitterCard: 'summary_large_image',
  twitterTitle: "IC Hack '25",
  twitterDescription:
    "Europe's largest student-run hackathon at Imperial College London",
  twitterImage: '/public/og/twitter_image.png'
});
</script>
