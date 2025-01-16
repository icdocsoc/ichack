<template>
  <input
    :type="type"
    v-model="modelValue"
    :class="[
      'error:outline-red-ic rounded bg-black p-2 outline outline-1',
      error ? 'outline-red-ic' : 'outline-white'
    ]"
    :placeholder="placeholder"
    :required="required"
    :name="name"
    :autocomplete="autocomplete"
    :pattern="pattern" />
</template>

<script setup lang="ts">
type Props = {
  type: 'text' | 'email' | 'password';
  name?: string;
  placeholder?: string;
  required?: boolean;
  autocomplete?: string;
  error?: string;
  pattern?: string;
};

const { required = false } = defineProps<Props>();
const modelValue = defineModel();
</script>
