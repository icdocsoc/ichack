<template>
  <div>
    <label
      v-if="!file"
      class="has-[:focus]:border-blue-ic hover:border-blue-ic relative flex cursor-pointer select-none items-center justify-between border px-3 py-5 transition lg:px-2 lg:py-4">
      <input
        type="file"
        :accept="accept"
        @change="handleFileChange"
        class="absolute h-0 w-0 opacity-0" />
      <img :src="icon" :alt="title" />
      <div class="flex items-center gap-4 px-2">
        <div class="flex flex-col items-end gap-2">
          <p class="text-2xl font-bold lg:text-lg">{{ title }}</p>
          <p class="text-lg text-gray-400 lg:text-sm">No file Selected</p>
        </div>
        <p class="font-ichack text-3xl">></p>
      </div>
    </label>
    <div
      v-else
      class="hover:border-blue-ic focus:border-blue-ic relative flex cursor-pointer select-none items-center justify-between border border-white px-3 py-5 transition focus:outline-none lg:px-2 lg:py-4"
      tabindex="0"
      @keydown="handleKeydown"
      @click.stop="handleDeleteFile">
      <img :src="icon" alt="Upload CV" />
      <div class="flex items-center gap-4 px-2">
        <div class="flex flex-col items-end gap-2">
          <p class="text-2xl font-bold lg:text-lg">{{ title }}</p>
          <p
            class="max-w-80 overflow-x-hidden text-ellipsis whitespace-nowrap text-lg text-gray-400 lg:text-sm">
            {{ file.name }}
          </p>
        </div>
        <span class="text-4xl font-black">X</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type Props = {
  title: string;
  accept: string;
  icon: string;
};

const file = defineModel<File | null>({
  default: null
});

defineProps<Props>();

const handleFileChange = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const f = target.files?.[0]!;
  if (f) {
    file.value = f;
  }
};

const handleDeleteFile = () => {
  file.value = null;
};

// Accessibility; so you can tab through the whole form
function handleKeydown(e: KeyboardEvent) {
  if (e.key != 'Enter' && e.key != ' ') return;
  e.target?.dispatchEvent(new Event('click'));
}
</script>
