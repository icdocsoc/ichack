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
</script>
