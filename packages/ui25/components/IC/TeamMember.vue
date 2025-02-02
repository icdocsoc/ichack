<template>
  <div
    :class="[
      'flex space-x-4 p-4 outline outline-1 outline-white',
      pending ? 'outline-dashed' : ''
    ]">
    <img
      src="@ui25/assets/mugshot.svg"
      :class="[color, 'size-16 self-center p-2']" />

    <p class="text-xl font-semibold">{{ leader ? '👑' : '' }} {{ name }}</p>

    <div
      v-if="!leader && editing"
      class="flex items-center justify-center gap-8">
      <img
        class="cursor-pointer"
        src="@ui25/assets/cross.svg"
        @click="emit('cross')" />
    </div>
  </div>
</template>

<script setup lang="ts">
type Props = {
  name: string;
  color: string;
  pending?: boolean;
  leader?: boolean;
  editing?: boolean;
};

defineProps<Props>();

const emit = defineEmits(['cross']);
</script>
