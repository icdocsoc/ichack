<template>
  <section class="font-ichack bg-black md:flex md:justify-center">
    <div
      class="mx-5 grid max-w-[1000px] grid-cols-2 grid-rows-4 gap-3 md:grid-cols-3 md:grid-rows-2 md:gap-x-10">
      <CountdownBox
        class="bg-blue-ic row-span-2 text-white max-md:col-span-2"
        :value="days"
        unit="days"
        size="large" />

      <CountdownBox
        class="bg-red-ic row-span-2 text-white"
        :value="hours"
        unit="hours"
        size="medium" />

      <CountdownBox
        class="bg-yellow-ic"
        :value="minutes"
        unit="minutes"
        size="small" />

      <CountdownBox
        class="bg-white"
        :value="seconds"
        unit="seconds"
        size="small" />
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
  const until = new Date(Date.UTC(2025, 1, 2, 9)); // Feb 1, 2025, 9:00 AM; Start of Day 1 of the event
  epochLeft.value = until.getTime() - Date.now();

  const interval = setInterval(() => {
    epochLeft.value -= 1000;
  }, 1000);
  onUnmounted(() => clearInterval(interval));
});
</script>
