<template>
  <div
    class="flex w-fit flex-row gap-5 border-[1px] border-dashed border-gray-200 p-4">
    <div :class="`${color} w-fit p-2`">
      <img src="@ui25/assets/mugshot.svg" />
    </div>
    <div class="flex flex-col">
      <p class="text-bold text-xl">{{ teamName }}</p>
      <div class="flex flex-row gap-5">
        <button
          class="text-green-500"
          title="Accept Invite"
          @click="$emit('accept')">
          Accept
        </button>
        <button
          class="text-red-ic"
          title="Decline Invite"
          @click="$emit('decline')">
          Decline
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
type Props = {
  teamName: string;
  color: string;
};
defineProps<Props>();
</script>

<style></style>
