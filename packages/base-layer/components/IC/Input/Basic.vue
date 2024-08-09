<script setup lang="ts">
  type Props = {
    placeholder: string;
    label: string;
    type: string;
  };

  const props = defineProps<Props>();
  const model = defineModel<string>();
</script>
<template>
  <h2 class="text-center pb-2">{{ props.label }}</h2>
  <input
    class="p-2 border-solid border-2 border-gray-300"
    v-model="model"
    :type="props.type"
    :placeholder="props.placeholder" />
</template>
