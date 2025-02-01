<template>
  <div class="flex items-center justify-between gap-x-8">
    <div>
      <label :for="name" class="text-2xl font-bold">{{ title }}</label>
      <p v-html="description" class="text-gray-400" />
    </div>

    <label
      :class="[
        'group relative grid select-none place-items-center',
        fixed ? '' : 'cursor-pointer'
      ]">
      <input
        type="checkbox"
        :name="name"
        :id="name"
        class="peer absolute h-0 w-0 opacity-0"
        :disabled="fixed"
        :checked="selected"
        v-model="selected" />
      <span
        :class="[
          spanStylesDefault,
          selected
            ? 'bg-blue-ic outline-blue-ic border-4 border-black'
            : 'outline-white'
        ]"></span>
    </label>
  </div>
</template>

<script setup lang="ts">
type Props = {
  title: string;
  name: string;
  description?: string;
  fixed?: boolean;
};

defineProps<Props>();

const selected = defineModel({
  default: false
});

const spanStylesDefault =
  'inline-block aspect-square size-8 outline outline-1 transition-all group-hover:outline-blue-ic peer-focus:outline-blue-ic';
</script>
