<template>
  <select
    :name="name"
    v-model="modelValue"
    :required="required"
    :placeholder="placeholder"
    class="focus:outline-blue-ic rounded bg-black px-2 py-3 outline outline-1 outline-white transition-all"
    :class="placeholderColor"
    @change="placeholderColor = ''">
    <option value="" hidden disabled>{{ placeholder }}</option>
    <option
      v-for="option in options"
      class="w-16 truncate bg-black text-white"
      :value="option.value"
      :selected="option.value === defaultValue">
      {{ option.displayName }}
    </option>
  </select>
</template>

<script setup lang="ts">
type Props = {
  name: string;
  placeholder: string;
  options: { displayName: string; value: string }[];
  required?: boolean;
  defaultValue?: string;
};

const props = defineProps<Props>();
const modelValue = defineModel({
  default: ''
});

const placeholderColor = ref('text-gray-400');

onMounted(() => {
  if (props.defaultValue) {
    modelValue.value = props.defaultValue;
  }
});
</script>
