<template>
  <div class="font-ichack flex items-center justify-center">
    <div class="mx-2 my-2 flex flex-wrap items-end gap-2">
      <p :class="displayValueClass">
        {{ displayValue }}
      </p>
      <p>{{ unit }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
type Props = {
  value: number;
  unit: string;
  size: 'large' | 'medium' | 'small';
};

const displayValue = computed(() => (value < 10 ? '0' + value : value));
const displayValueClass = computed(() => {
  switch (size) {
    case 'large':
      return 'text-8xl md:text-7xl';
    case 'medium':
      return 'text-6xl md:text-6xl lg:text-7xl';
    case 'small':
      return 'text-4xl';
  }
});

const { value, unit, size } = defineProps<Props>();
</script>
