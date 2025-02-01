<template>
  <ICWindow
    :name="titleText(type)"
    :color="`${colors[type].window}`"
    :border="`${colors[type].border}`"
    :titleTheme="`${colors[type].title}`"
    :closeable="true"
    background="bg-black">
    <template v-if="type == 'title'" #controls>
      <div class="self-stretch overflow-hidden">
        <div
          class="mx-3 flex h-[200%] -translate-y-3 rotate-[30deg] gap-1 [&>div]:w-2">
          <div class="bg-red-ic"></div>
          <div class="bg-yellow-ic"></div>
          <div class="bg-blue-ic"></div>
        </div>
      </div>
    </template>

    <div
      class="my-4 flex"
      :class="textPosition == 'left' ? 'flex-row' : 'flex-row-reverse'">
      <div
        v-if="asideText"
        :class="[
          colors[type].asideText,
          type == 'bronze' ? 'max-h-min' : '',
          'text-horizontal text-4xl font-black uppercase lg:max-h-min'
        ]">
        {{ asideText }}
      </div>
      <div
        class="mx-5 flex w-full flex-wrap items-center justify-center gap-x-24 gap-y-10">
        <img
          v-for="sponsor in sponsors"
          :src="sponsor.img"
          :alt="sponsor.desc"
          :class="[
            imageStyles(type, sponsor.desc),
            sponsor.link ? 'cursor-pointer' : ''
          ]"
          :key="sponsor.desc"
          @click="redirect(sponsor.link)" />
      </div>
    </div>
  </ICWindow>
</template>

<script lang="ts" setup>
type Sponsor = { img: string; desc: string; link: string };
type Props = {
  sponsors: Sponsor[];
  type: 'title' | 'bronze' | 'silver' | 'gold' | 'partners';
  asideText?: string;
  textPosition?: 'left' | 'right';
};
const { textPosition = 'left' } = defineProps<Props>();

/**
 * window is the background color of the window
 * border is the border color of the window
 * text is the text color of the horizontal big text
 * title is the text color of the title bar in the window
 */
const colors = {
  title: {
    window: 'bg-white',
    border: 'border-white',
    asideText: 'text-white', // UNUSED
    title: 'dark'
  },
  bronze: {
    window: 'bg-bronze-ic',
    border: 'border-bronze-ic',
    asideText: 'text-bronze-ic',
    title: 'dark'
  },
  silver: {
    window: 'bg-silver-ic',
    border: 'border-silver-ic',
    asideText: 'text-silver-ic',
    title: 'dark'
  },
  gold: {
    window: 'bg-gold-ic',
    border: 'border-gold-ic',
    asideText: 'text-gold-ic',
    title: 'dark'
  },
  partners: {
    window: 'bg-blue-ic',
    border: 'border-white-ic',
    asideText: 'text-white',
    title: 'light'
  }
} as const;

const titleText = (type: Props['type']) => {
  switch (type) {
    case 'title':
      return 'title_sponsor.png';
    case 'partners':
      return 'partners.pdf';
    default:
      return `${type}_sponsors.pdf`;
  }
};

const imageStyles = (type: Props['type'], name?: string): string => {
  if (name && name == 'helsing') {
    return 'max-h-24 md:max-h-28'; // TODO change this
  }

  const styles = {
    title: '',
    gold: 'max-h-20 md:max-h-14 max-w-40 md:max-w-60 lg:max-w-80',
    silver: 'max-h-20 md:max-h-14 lg:max-h-12 md:max-w-60',
    bronze: 'max-h-20 md:max-h-20 lg:max-h-24',
    partners: 'max-h-20 md:max-h-16 lg:max-h-14 md:max-w-60'
  } as const;

  return styles[type];
};

const redirect = (link: string) => {
  // They should all have links, but just in case (it would previously reload the page)
  if (!link) return;
  navigateTo(link, {
    external: true,
    open: { target: '_blank' }
  });
};
</script>
