<template>
  <section class="font-ichack bg-black px-5 xl:px-16">
    <div
      class="mx-auto grid max-w-[1080px] grid-cols-2 grid-rows-4 gap-3 md:grid-cols-3 md:grid-rows-2">
      <CountdownBox
        class="bg-blue-ic row-span-2 max-md:col-span-2"
        :value="days"
        unit="days"
        size="large" />

      <CountdownBox
        class="bg-red-ic row-span-2"
        :value="hours"
        unit="hours"
        size="medium" />

      <CountdownBox
        class="bg-yellow-ic text-black"
        :value="minutes"
        unit="minutes"
        size="small" />

      <CountdownBox
        class="bg-white text-black"
        :value="seconds"
        unit="seconds"
        size="small" />

      <p class="col-span-2 text-end md:col-span-3">
        ...Since the Hackathon ended
      </p>
    </div>
  </section>
</template>

<script lang="ts" setup>
const epochLeft = ref(0);

const days = computed(
  () => Math.floor(epochLeft.value / (1000 * 60 * 60 * 24)) % 365
);
const hours = computed(
  () => Math.floor(epochLeft.value / (1000 * 60 * 60)) % 24
);
const minutes = computed(() => Math.floor(epochLeft.value / (1000 * 60)) % 60);
const seconds = computed(() => Math.floor(epochLeft.value / 1000) % 60);

onMounted(() => {
  const until = new Date(Date.UTC(2025, 1, 2, 12)); // Feb 2, 2025, 12:00 PM; End of the hackathon
  const untilTime = until.getTime();
  epochLeft.value = Math.abs(until.getTime() - Date.now());

  const interval = setInterval(() => {
    epochLeft.value = Math.abs(untilTime - Date.now());
  }, 1000);
  onUnmounted(() => clearInterval(interval));
});
</script>
