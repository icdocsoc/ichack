<template>
  <!-- <ICNavBar :buttons="buttons" />

  <main>
    <SectionJumbotron />
    <SectionCountdown class="py-12" />
  </main> -->
  <main
    class="bg-red-ic flex h-screen w-screen flex-col justify-center gap-10 overflow-hidden">
    <h1 class="hidden">IC Hack '25</h1>
    <div class="flex flex-col items-end gap-6">
      <div class="flex justify-end gap-8 self-stretch">
        <div class="bar aspect-square"></div>
        <div class="bar w-8/12"></div>
      </div>
      <div class="bar w-7/12"></div>
      <div class="bar w-6/12"></div>
      <div class="bar w-5/12"></div>
    </div>
    <div
      class="font-ichack text-darkblue-ic max-w-min self-center text-center text-5xl sm:text-6xl">
      Big things are coming...
    </div>
    <div class="flex flex-col-reverse items-start gap-6">
      <div class="flex justify-start gap-8 self-stretch">
        <div class="bar w-8/12"></div>
        <div class="bar aspect-square"></div>
      </div>
      <div class="bar w-7/12"></div>
      <div class="bar w-6/12"></div>
      <div class="bar w-5/12"></div>
    </div>
  </main>
</template>

<script setup lang="ts">
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
  // ogImage: '/public/og/image.png',

  twitterCard: 'summary_large_image',
  twitterTitle: "IC Hack '25",
  twitterDescription:
    "Europe's largest student-run hackathon at Imperial College London"
  // twitterImage: '/public/og/twitter_image.png'
});
</script>

<style scoped>
div.bar {
  @apply bg-darkblue-ic inline-block h-5;
}
</style>
