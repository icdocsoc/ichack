<template>
  <div
    class="mb-6 transform rounded-lg border bg-white p-6 text-center transition-transform hover:-translate-y-1 hover:shadow-lg"
    :class="{ 'border-blue-400 bg-blue-50': isPinned }">
    <header class="mb-4">
      <div class="flex items-center justify-between">
        <h2 class="text-center text-xl font-semibold text-gray-800">
          <span
            v-if="isPinned"
            class="bg-transparent px-2 py-1 text-sm font-bold text-gray-900">
            📌
          </span>
          {{ announcement.title }}
        </h2>
        <div class="flex items-center space-x-3">
          <Icon
            v-if="announcement.synced"
            name="heroicons-check-circle"
            class="h-5 w-5 text-green-500"
            title="Synced with Discord" />
          <Icon
            v-else
            name="heroicons-arrow-path"
            class="h-5 w-5 cursor-pointer text-blue-500"
            title="Not synced with Discord. Try again."
            @click="$emit('resync', announcement.id!)" />
          <Icon
            name="heroicons-outline:trash"
            class="h-5 w-5 cursor-pointer text-red-500"
            title="delete"
            @click="$emit('delete', announcement.id!)" />
          <Icon
            name="heroicons-outline:pencil"
            class="h-5 w-5 cursor-pointer text-red-500"
            title="Edit"
            @click="$emit('edit', announcement)" />
        </div>
      </div>
      <p class="text-left text-base italic text-gray-700">
        Location: {{ announcement.location }}
      </p>
    </header>
    <p class="text-base text-gray-700">{{ announcement.description }}</p>
    <footer class="flex justify-between text-sm text-gray-500">
      <span>Created: {{ formatDate(announcement.created.toString()) }}</span>
      <span v-if="isPinned">
        Pinned Until: {{ formatDate(announcement.pinUntil!.toString()) }}
      </span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '#components';
import type { AnnouncementDetails } from '~~/shared/types';

type Props = {
  announcement: AnnouncementDetails;
};
const { announcement } = defineProps<Props>();

type Emits = {
  delete: [id: number];
  edit: [announcement: AnnouncementDetails];
  resync: [id: number];
};
defineEmits<Emits>();

const isPinned = computed(() => {
  if (!announcement.pinUntil) return false; // If no pinnedUntil date, not pinned
  const today = new Date();
  const pinDate = announcement.pinUntil
    ? new Date(announcement.pinUntil)
    : null;
  if (!pinDate) return false;
  return announcement.pinUntil && today <= pinDate;
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-GB');
};
</script>
