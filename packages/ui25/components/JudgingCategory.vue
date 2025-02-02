<template>
  <div class="mt-4">
    <div class="w-100 border-2 border-white bg-black p-4 text-center text-lg">
      <p class="font-bold">{{ title }}</p>
      <p class="">Current Room</p>
      <div class="flex items-center justify-center gap-3 pt-4">
        <div
          v-for="room in rooms"
          :key="room.id"
          class="flex items-center gap-3">
          <div
            class="-ic rounded-md border border-white px-4 py-2 text-sm transition"
            :class="[
              selectedRoom === room.name ? 'bg-blue-ic' : 'bg-black',
              isAdmin ? 'cursor-pointer' : ''
            ]"
            @click="isAdmin ? updateRoom(room.value) : null">
            {{ room.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Hackspace } from '~~/server/src/types';
type UpperCaseRoom = 'QTR' | 'JCR' | 'SCR' | 'Roaming';

const currentRoom = defineModel<Hackspace | null>();
const selectedRoom = ref<UpperCaseRoom>(
  (currentRoom.value?.toUpperCase() as UpperCaseRoom) ?? 'Roaming'
);

type Props = {
  title: string;
  slug: string;
  isAdmin: boolean;
};

watch(currentRoom, value => {
  selectedRoom.value = (value?.toUpperCase() as UpperCaseRoom) ?? 'Roaming';
});

const props = defineProps<Props>();

const { updateJudging } = useAdmin();

const updateRoom = (room: Hackspace | null) => {
  updateJudging(props.slug, room);
  selectedRoom.value =
    (room?.toUpperCase() as UpperCaseRoom) ?? ('Roaming' as const);
};

const rooms: { id: number; name: string; value: Hackspace | null }[] = [
  { id: 1, name: 'QTR', value: 'qtr' },
  { id: 2, name: 'JCR', value: 'jcr' },
  { id: 3, name: 'SCR', value: 'scr' },
  { id: 4, name: 'Roaming', value: null }
];
</script>
