<template>
  <template>
    <div>
      <UCard
        :ui="{
          background: success
            ? 'bg-green-100 dark:bg-green-700'
            : 'bg-red-700 dark:bg-red-600'
        }">
        <template #header>
          <h1 class="font-ichack text-2xl">
            {{ success ? 'success' : 'failure' }}
          </h1>
        </template>
        <div class="flex flex-row text-lg">
          <div class="flex-1 text-center">
            <p><strong>Name:</strong></p>
            <p>{{ profile.name }}</p>
          </div>
          <div class="flex-1 text-center">
            <p><strong>Role:</strong></p>
            <p>{{ profile.role }}</p>
          </div>
          <div class="flex-1 text-center">
            <p><strong>Id:</strong></p>
            <p>{{ profile.id }}</p>
          </div>
        </div>
        <template class="bg-red items-center" #footer>
          <p class="font-archivo text-lg">
            {{ success ? 'checked in!' : `an error occured: ${errMsg}` }}
          </p>
        </template>
      </UCard>
    </div>
  </template>
</template>

<script lang="ts" setup>
import type { Profile } from '~~/shared/types';

type Props = {
  profile: Profile;
  success: boolean;
  errMsg: string | null;
};
defineProps<Props>();
</script>

<style></style>
