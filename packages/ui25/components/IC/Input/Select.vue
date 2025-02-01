<template>
  <div class="flex flex-col gap-y-2">
    <select
      :name="name"
      v-model="selected"
      :required="required"
      :placeholder="placeholder"
      class="focus:outline-blue-ic w-full rounded bg-black px-2 py-3 outline outline-1 outline-white transition-all"
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
      <option v-if="other" class="bg-black text-white" value="other">
        Other
      </option>
    </select>
    <ICInput
      v-model="otherValue"
      :placeholder="placeholder"
      v-if="selected == 'other'"
      class="w-full" />
  </div>
</template>

<script setup lang="ts">
type Props = {
  name: string;
  placeholder: string;
  options: { displayName: string; value: string }[];
  required?: boolean;
  defaultValue?: string;
  other?: boolean;
};

const props = defineProps<Props>();
// This type should probably be fixed. It's to stop complaints from nullable values in the db
// like pronouns
const modelValue = defineModel<string | null>({
  default: ''
});

const selected = ref('');
const otherValue = ref('');

watch(selected, () => {
  if (selected.value == 'other') {
    modelValue.value = otherValue.value;
  } else {
    modelValue.value = selected.value;
  }
});

watch(otherValue, () => {
  modelValue.value = otherValue.value;
});

const placeholderColor = ref('text-gray-400');

onMounted(() => {
  if (props.defaultValue) {
    modelValue.value = props.defaultValue;
  } else if (modelValue.value != '') {
    placeholderColor.value = '';
    selected.value = modelValue.value!;
  }
});
</script>
