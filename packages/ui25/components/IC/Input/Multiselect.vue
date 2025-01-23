<template>
  <div>
    <ICInputCheckbox :title="title" :name="name" v-model="show" />

    <div
      v-if="show"
      class="border-1 mt-4 flex flex-wrap gap-2 border border-white p-4">
      <div
        :class="`${centerTextStyle} ${boxStyle}`"
        class="hover:border-blue-ic hover:bg-blue-ic"
        @keydown="handleKeydown"
        tabindex="0"
        v-for="option in notSelected"
        @click="addRestriction(option)">
        <p>
          {{ option }}
        </p>
      </div>

      <div
        :class="`${centerTextStyle} ${boxStyle}`"
        class="hover:border-blue-ic hover:bg-blue-ic"
        tabindex="0"
        v-if="other"
        @keydown="handleKeydown"
        @click="othering = !othering">
        <p v-if="!othering">Other</p>
        <input
          v-else
          v-model="otherRes"
          type="text"
          @keydown="handleConfirmOther"
          class="bg-transparent focus:outline-none"
          @click="e => e.stopPropagation()"
          placeholder="Other" />
      </div>
    </div>

    <div class="flex flex-wrap gap-2 pt-2">
      <div
        :class="`${centerTextStyle} ${boxStyle}`"
        class="hover:bg-red-ic hover:border-red-ic"
        tabindex="0"
        @keydown="handleKeydown"
        v-for="selected in modelValue"
        @click="removeRestriction(selected)">
        {{ selected }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type Props = {
  title: string;
  name: string;
  options: string[];
  other?: boolean;
};

const props = defineProps<Props>();
const show = ref(false);
const othering = ref(false);
const otherRes = ref('');

const boxStyle = 'border-1 cursor-pointer border border-white transition';
const centerTextStyle = 'flex flex-col justify-center px-2 py-1 text-center';

const notSelected = ref([...props.options]);

const modelValue = defineModel<string[]>({
  default: [] as string[]
});

const addRestriction = (option: string) => {
  modelValue.value = [...modelValue.value, option];
  notSelected.value = notSelected.value.filter(item => item !== option);
};

const removeRestriction = (option: string) => {
  modelValue.value = modelValue.value.filter(item => item !== option);
  if (props.options.includes(option)) {
    notSelected.value = [...notSelected.value, option];
  }
};

function handleConfirmOther(e: KeyboardEvent) {
  if (e.key != 'Enter') return;
  addRestriction(otherRes.value);
  otherRes.value = '';
  othering.value = false;
}

// This is for accessibility reasons; so you can tab to an element and select w enter/space
function handleKeydown(e: KeyboardEvent) {
  if (e.key != 'Enter' && e.key != ' ') return;
  e.target?.dispatchEvent(new Event('click'));
}
</script>
