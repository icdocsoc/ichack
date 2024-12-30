<template>
  <nav class="relative flex justify-between bg-black px-5">
    <!-- <img src="@ui25/assets/cropped_logo.svg" class="mt-4" /> -->

    <!-- <ICHamburger
      class="w-8 self-center lg:hidden"
      @toggle="v => (hamburgerActive = v)" /> -->
    <ul :class="menuStyles">
      <li v-for="(button, i) in buttons" :key="i">
        <!-- TODO change this depending on new page or different section -->
        <a class="flex items-center space-x-3" :href="button.to">
          <div :class="`${bgColors[i % 3]} size-5`" />
          <p class="font-archivo text-2xl font-medium text-white">
            {{ button.title }}
          </p>
        </a>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts" setup>
type Props = {
  buttons?: { title: string; to: string }[];
};
const { buttons = [] } = defineProps<Props>();
const bgColors = ['bg-blue-ic', 'bg-red-ic', 'bg-yellow-ic'];

const hamburgerActive = ref(false);
const menuStyles = computed(() => {
  const mobileStyles = [
    'absolute',
    'right-4',
    'top-full',
    'z-50',
    'mt-4',
    'max-w-fit',
    'rounded-xl',
    'bg-black',
    'p-4',
    'transition-[transform,opacity]',
    'duration-500',
    'ease-in-out',
    ...(hamburgerActive.value
      ? ['translate-x-0', 'opacity-100']
      : ['translate-x-full', 'opacity-0'])
  ];
  const desktopStyles = [
    'lg:static',
    'lg:m-0',
    'lg:rounded-none',
    'lg:translate-x-0',
    'lg:opacity-100',
    'lg:flex',
    'lg:space-x-12',
    'lg:items-center'
  ];

  return [...mobileStyles, ...desktopStyles];
});
</script>
