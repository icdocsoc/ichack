<template>
  <div class="flex max-w-fit items-center gap-x-4">
    <img :src="hackspacesInfo[hackspace].image" />
    <p class="text-xl font-bold">{{ hackspacesInfo[hackspace].name }}</p>
  </div>
</template>

<script setup lang="ts">
import qtr from '@ui25/assets/qtr.svg';
import scr from '@ui25/assets/scr.svg';
import jcr from '@ui25/assets/jcr.svg';

type Props = {
  hackspace: 'jcr' | 'scr' | 'qtr';
};

defineProps<Props>();

const hackspacesInfo = {
  qtr: { name: 'Queens Tower Room', image: qtr },
  scr: { name: 'Senior Common Room', image: scr },
  jcr: { name: 'Junior Common Room', image: jcr }
};
</script>
