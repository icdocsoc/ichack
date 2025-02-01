<template>
  <div class="w-full">
    <p class="text-2xl font-bold capitalize text-white">
      {{ announcement.title }} #1
    </p>

    <div class="flex flex-row items-center pt-5 align-middle">
      <div
        class="flex h-10 w-10 items-center justify-center bg-white align-middle">
        <Icon name="heroicons-map-pin" class="size-8 text-black" />
      </div>
      <div class="pl-3">
        <h3 class="text-lg font-bold">{{ announcement.location }}</h3>
        <p class="text-m font-extralight">
          {{ format(announcement.created, 'dd MMM | HH:mm') }}
        </p>
      </div>
    </div>
  </div>
  <p class="pt-3">
    {{ announcement.description }}
  </p>
</template>

<script lang="ts" setup>
import { format } from 'date-fns';
import type { AnnouncementDetails } from '~~/shared/types';
type Props = { announcement: AnnouncementDetails };

defineProps<Props>();
</script>

<style></style>
