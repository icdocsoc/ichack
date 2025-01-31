<template>
  <div v-if="announcements.length">
    <h3 class="text-center text-2xl font-semibold">
      {{ title }}
    </h3>
    <br />
    <div v-for="announcement in announcements" :key="announcement.id">
      <AnnouncementsCard
        :announcement="announcement"
        @delete="
          announcement.id !== undefined
            ? $emit('handleDelete', announcement.id)
            : null
        "
        @edit="$emit('handleEdit', announcement)"
        @resync="
          announcement.id !== undefined
            ? $emit('handleResync', announcement.id)
            : null
        " />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { AnnouncementDetails } from '~~/shared/types';

type Props = {
  announcements: AnnouncementDetails[];
  title: string;
};

type Emits = {
  handleDelete: [id: number];
  handleEdit: [announcement: AnnouncementDetails];
  handleResync: [id: number];
};
defineProps<Props>();
defineEmits<Emits>();
</script>
