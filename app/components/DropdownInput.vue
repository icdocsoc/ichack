<script setup lang="ts">
import type { DropdownItem } from '#ui/types';

type Props = {
  items: DropdownItem[][];
};
const model = defineModel<string>();
const props = defineProps<Props>();
</script>
<template>
  <UDropdown :items="props.items">
    <UButton :label="model" trailing-icon="heroicons-chevron-down-20-solid" />
  </UDropdown>
</template>
