<template>
  <nav
    class="sticky top-0 z-50 flex justify-between bg-black px-5 lg:overflow-hidden">
    <img src="@ui25/assets/logo-white.svg" class="my-2" />

    <ICHamburger
      v-if="links.length"
      class="w-8 self-center lg:hidden"
      v-model="hamburgerActive" />
    <ul :class="menuStyles" class="flex items-end max-lg:flex-col">
      <li v-for="(item, i) in links">
        <a :href="item.to">
          <p :class="linkStyles(i)">
            {{ item.label }}
          </p>
        </a>
      </li>
      <li class="self-stretch max-lg:hidden">
        <div
          class="flex h-[500%] -translate-y-14 rotate-[30deg] gap-3 [&>div]:w-4">
          <div class="bg-red-ic"></div>
          <div class="bg-yellow-ic"></div>
          <div class="bg-blue-ic"></div>
        </div>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts" setup>
type Props = {
  links?: { label: string; to: string }[];
};
const { links = [] } = defineProps<Props>();

const afterBoxBg = [
  'after:bg-red-ic',
  'after:bg-yellow-ic',
  'after:bg-blue-ic'
];

const hoverTextColors = [
  'lg:hover:text-red-ic',
  'lg:hover:text-yellow-ic',
  'lg:hover:text-blue-ic'
];

const hamburgerActive = ref(false);
const menuStyles = computed(() => {
  const mobileStyles = [
    'absolute',
    'right-4',
    'top-full',
    'z-40',
    'mt-4',
    'max-w-fit',
    'bg-black',
    'p-4',
    'transition-[transform,opacity]',
    'duration-500',
    'ease-in-out',
    'max-lg:border-2',
    'border-white',
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

const linkStyles = (i: number): string[] => {
  const mobileStyles = [
    'flex',
    'origin-top',
    'items-center',
    'gap-3',
    'text-2xl',
    'font-medium',
    'text-white',
    'transition',
    'duration-500',
    'ease-in-out',
    'max-lg:my-1',
    'after:aspect-square',
    'after:w-6',
    'after:content-normal',
    afterBoxBg[i % 3]
  ];

  const desktopStyles = [
    'lg:after:content-none',
    'lg:hover:scale-110',
    hoverTextColors[i % 3]
  ];

  return [...mobileStyles, ...desktopStyles];
};
</script>
