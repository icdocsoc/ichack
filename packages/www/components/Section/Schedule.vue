<template>
  <section
    id="schedule"
    class="relative mx-auto flex max-w-[80%] flex-col justify-center px-5 md:flex-row">
    <div class="absolute top-0">
      <div id="schedule-1"></div>
      <div id="schedule-2"></div>
    </div>
    <div
      class="font-ichack sticky top-[60px] z-10 ml-6 w-full self-start bg-black/50 backdrop-blur-sm md:top-[80px] md:ml-0 md:w-auto">
      <h1 class="text-4xl uppercase">Schedule</h1>
      <div class="mt-2 flex gap-4 md:justify-end">
        <a
          href="#schedule-1"
          :class="`font-ichack z-20 px-1 py-2 text-xl uppercase leading-9 md:text-2xl ${day == 1 ? 'bg-blue-ic' : ''}`"
          @click="() => (day = 1)">
          1st
        </a>
        <a
          href="#schedule-2"
          :class="`font-ichack px-1 py-2 text-xl uppercase leading-9 md:text-2xl ${day == 2 ? 'bg-red-ic' : ''}`"
          @click="() => (day = 2)">
          2nd
        </a>
      </div>
    </div>
    <div
      class="relative hidden w-8 bg-[url(~/assets/svgs/line-divider.svg)] bg-center bg-repeat-y p-8 md:block"></div>
    <div
      class="absolute left-0 h-full w-6 bg-[url(~/assets/svgs/line-divider.svg)] bg-center bg-repeat-y md:hidden"></div>
    <!-- RHS details -->

    <div
      class="relative ml-6 inline-block max-lg:mt-8 max-sm:z-0 lg:ml-7 lg:w-1/2">
      <div
        v-for="(event, index) in schedule"
        :key="event.title"
        class="mb-16 flex flex-col items-start gap-4 md:mb-32"
        ref="refs">
        <h2 :class="`font-ichack ${nextTxtColor(index)} text-4xl md:text-6xl`">
          {{ format(event.startsAt, 'HH:mm') }}
          <!-- prettier-ignore -->
          <span v-if="event.endsAt"> - {{ format(event.endsAt, 'HH:mm') }}</span>
        </h2>
        <h2 class="text-xl font-extrabold capitalize text-white md:text-4xl">
          {{ event.title }}
        </h2>
        <p class="text-2xl font-normal lowercase leading-snug text-white">
          {{ event.description }}
        </p>
        <div
          v-for="(loc, loc_index) in event?.locations ?? []"
          :key="loc"
          :class="`flex ${nextColor(index + loc_index)} w-full items-center justify-start md:w-[80%]`">
          <img
            src="@ui25/assets/location-sign.svg"
            alt="location"
            class="m-4" />
          <p
            class="pr-4 text-lg font-extrabold leading-[15px] text-white md:text-2xl">
            {{ locationToFullName[loc] }}
          </p>
        </div>
        <img
          :src="getImage(event)"
          :alt="event.locations[0]"
          class="md:w-[80%]" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { EventLocation, Event as ICEvent } from '#shared/types';
import { filename } from 'pathe/utils';
import { format } from 'date-fns';

type Schedule = [ICEvent[], ICEvent[]];

const glob = import.meta.glob('~/public/locations/*.jpeg', {
  eager: true
});

const images = Object.fromEntries(
  Object.entries(glob).map(([key, value]) => [
    filename(key),
    // @ts-ignore - default is not in the type
    value.default
  ])
) as Record<EventLocation, string>;

const schedules = ref<Schedule | null>(null);
onMounted(async () => {
  const { getEvents } = useEvents();
  const eventRes = await getEvents();
  const events: ICEvent[] = eventRes.getOrThrow();
  schedules.value = [
    events.filter(e => e.startsAt.getUTCDate() === 1),
    events.filter(e => e.startsAt.getUTCDate() === 2)
  ];
});

const day = ref<1 | 2>(1);
const schedule = computed<ICEvent[]>(() => {
  if (!schedules.value) return [];
  return day.value === 1 ? schedules.value[0] : schedules.value[1];
});

function nextTxtColor(index: number) {
  switch (index % 3) {
    case 0:
      return 'text-blue-ic';
    case 1:
      return 'text-red-ic';
    case 2:
      return 'text-yellow-ic';
    default:
      throw new Error('Invalid index');
  }
}

function nextColor(index: number) {
  switch (index % 3) {
    case 0:
      return 'bg-blue-ic';
    case 1:
      return 'bg-red-ic';
    case 2:
      return 'bg-yellow-ic';
    default:
      throw new Error('Invalid index');
  }
}

function getImage(event: ICEvent) {
  const loc = !event.locations.length ? 'HXLY' : event.locations[0]!;
  return images[loc];
}

const locationToFullName: Record<EventLocation, string> = {
  HXLY: 'HUXLEY BUILDING',
  JCR: 'JUNIOR COMMON ROOM',
  SCR: 'SENIOR COMMON ROOM',
  QTR: "QUEEN'S TOWER ROOMS",
  QLWN: "QUEEN'S LAWN",
  HBAR: 'ħ-bar',
  ICME: 'IMPERIAL COLLEGE MAIN ENTRANCE',
  GRHL: 'GREAT HALL',
  SF: 'SHERFIELD BUILDING',
  CLR: 'HUXLEY CLORE THEATRE',
  H308: 'HUXLEY LECTURE THEATRE 308',
  H311: 'HUXLEY LECTURE THEATRE 311',
  H340: 'HUXLEY LECTURE THEATRE 340',
  HF: 'HUXLEY FOYER'
};
</script>
