<template>
  <section
    class="font-ichack flex w-full place-content-center gap-x-7 bg-black text-white">
    <CountdownBox
      class="bg-blue-ic row-span-2"
      :value="days"
      unit="days"
      size="large" />

    <CountdownBox
      class="bg-red-ic row-span-2"
      :value="hours"
      unit="hours"
      size="large" />

    <div class="flex h-auto flex-col gap-y-5 text-black">
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
const until = new Date(2025, 1, 2, 9); // Feb 1, 2025, 9:00 AM

const epochLeft = useState<number>(
  'countdown_timer',
  () => until.getTime() - Date.now()
);

const days = computed(
  () => Math.floor(epochLeft.value / (1000 * 60 * 60 * 24)) % 365
);
const hours = computed(
  () => Math.floor(epochLeft.value / (1000 * 60 * 60)) % 24
);
const minutes = computed(() => Math.floor(epochLeft.value / (1000 * 60)) % 60);
const seconds = computed(() => Math.floor(epochLeft.value / 1000) % 60);

onMounted(() => {
  const interval = setInterval(() => {
    epochLeft.value -= 1000;
  }, 1000);

  onUnmounted(() => clearInterval(interval));
});
</script>
