<script setup lang="ts">
  type Props = {
    placeholderTxt: string;
    name: string;
    type: string;
  };
  const props = defineProps<Props>();
  const model = defineModel<string>();
</script>
<template>
  <h2 class="text-center pb-2">{{ props.name }}</h2>
  <input
    class="p-2 border-solid border-2 border-gray-300"
    :type="type"
    v-model="model"
    :placeholder="props.placeholderTxt" />
</template>
