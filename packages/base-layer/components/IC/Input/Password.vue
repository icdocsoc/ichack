<script setup lang="ts">
  type Props = {
    placeholder: string;
    label: string;
  };

  const props = defineProps<Props>();
  const model = defineModel<string>();
</script>

<template>
  <ICInputBasic
    v-model="model"
    :placeholder="props.placeholder"
    :label="props.label"
    type="password" />
</template>
