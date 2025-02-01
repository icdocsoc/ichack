<template>
  <div>
    <UCard
      :ui="{
        background: success
          ? 'bg-green-400 dark:bg-green-700'
          : 'bg-red-60 dark:bg-red-600'
      }">
      <template #header>
        <h1 class="font-ichack text-center text-xl">
          {{ success ? 'USER MAY EAT!' : `FAILED: ${errMsg}` }}
        </h1>
      </template>

      <div
        class="flex w-full flex-col items-center justify-center rounded-3xl bg-red-600">
        <h2 class="text-1xl mr-2 font-bold">Dietary Requirements!</h2>
        <ul class="flex flex-row space-x-4">
          <li
            v-for="item in profile.dietary_restrictions"
            :key="item"
            class="text-2xl font-bold">
            {{ item }}
          </li>
        </ul>
      </div>

      <template class="items-center" #footer>
        <div class="flex flex-row text-sm">
          <div class="flex-1 text-center">
            <p><strong>Name:</strong></p>
            <p>{{ profile.name }}</p>
          </div>
          <div class="flex-1 text-center">
            <p><strong>Role:</strong></p>
            <p>{{ profile.role }}</p>
          </div>
          <!-- <div class="flex-1 text-center text-xs">
            <p><strong>Id:</strong></p>
            <p>{{ profile.id }}</p>
          </div> -->
        </div>
      </template>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import { UCard } from '#components';
import type { Profile } from '~~/shared/types';

type Props = {
  profile: Profile;
  success: boolean;
  errMsg: string | null;
};

defineProps<Props>();
</script>

<style></style>
