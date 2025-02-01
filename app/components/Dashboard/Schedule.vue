<script setup lang="ts">
import { format } from 'date-fns';
import type { Event as ICEvent } from '#shared/types';

type Prop = {
  events: ICEvent[];
};
defineProps<Prop>();
</script>

<template>
  <div class="inline-flex gap-4 lg:flex-col-reverse lg:overflow-x-hidden">
    <div class="bg-white max-lg:w-2 lg:h-2"></div>
    <div
      class="no-scrollbar flex flex-initial gap-2 overflow-x-scroll max-lg:flex-col">
      <!-- <div
        v-for="event in events"
        :key="event.id"
        class="flex justify-between gap-4 border border-white px-3 py-2">
        <p class="flex-1 text-ellipsis text-xl">{{ event.title }}</p>
        <div class="flex items-center gap-2">
          <img src="@ui25/assets/clock.svg" alt="" />
          <p>{{ format(event.startsAt, 'HH:mm') }}</p>
        </div>
      </div> -->
      <div
        v-for="event in events"
        :key="event.id"
        class="border border-white px-3 py-2">
        <p
          class="min-w-[100px] overflow-x-hidden text-ellipsis whitespace-nowrap">
          {{ event.title }}
        </p>
        <div class="flex items-center gap-2">
          <img
            src="@ui25/assets/clock.svg"
            :alt="format(event.startsAt, 'HH:mm')" />
          <span>{{ format(event.startsAt, 'HH:mm') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
