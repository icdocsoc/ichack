<template>
  <UCard>
    <template #header>
      <div class="flex flex-row flex-wrap items-start justify-around space-x-2">
        <!-- Name Column -->
        <div class="flex min-w-max flex-col items-center">
          <!-- Label (optional, e.g. “Name”) -->
          <p class="font-archivo mb-1 text-sm text-gray-500">Name</p>
          <!-- Actual name -->
          <h1 class="font-archivo text-sm">{{ profile.name }}</h1>
          <!-- Pronouns in smaller gray text, if provided -->
          <p v-if="profile.pronouns" class="font-archivo text-sm text-gray-600">
            {{ profile.pronouns }}
          </p>
        </div>
        <!-- Email Column -->
        <div class="flex flex-col flex-wrap items-start">
          <!-- Label -->
          <p class="font-archivo mb-1 text-sm text-gray-500">Email</p>
          <!-- Value -->
          <p class="font-archivo text-sm">{{ profile.email }}</p>
        </div>

        <!-- Role Column -->
        <div class="flex flex-col items-end">
          <!-- Label -->
          <p class="font-archivo mb-1 text-sm text-gray-500">Role</p>
          <!-- Value -->
          <p class="font-archivo text-sm">{{ profile.role }}</p>
        </div>
      </div>
    </template>

    <div
      class="flex w-full flex-row items-start justify-between space-x-4 text-sm">
      <!-- Dietary Restrictions Column -->
      <div class="flex flex-col">
        <h3 class="mb-1 whitespace-nowrap font-semibold">
          Dietary Restrictions
        </h3>
        <!-- UL horizontally laid out -->
        <ul
          class="align-center flex flex-row flex-wrap justify-center space-x-2">
          <li v-for="diet in profile.dietary_restrictions" :key="diet">
            {{ diet }}
          </li>
        </ul>
      </div>

      <!-- Meals Had Column -->
      <div class="flex flex-col text-center text-sm">
        <h3 class="mb-1 font-semibold">Meals Had</h3>
        <!-- UL horizontally laid out -->
        <ul
          class="align-center flex flex-row flex-wrap justify-center space-x-2">
          <li
            :class="{
              'text-green-500': profile.meals[0],
              'text-red-500': !profile.meals[0]
            }">
            Lunch-1
          </li>
          <li
            :class="{
              'text-green-500': profile.meals[1],
              'text-red-500': !profile.meals[1]
            }">
            Dinner
          </li>
          <li
            :class="{
              'text-green-500': profile.meals[2],
              'text-red-500': !profile.meals[2]
            }">
            Lunch-2
          </li>
        </ul>
      </div>
    </div>

    <template #footer>
      <div class="flex w-full flex-row items-center justify-between">
        <p
          :class="{
            'text-green-500': !profile.photos_opt_out,
            'text-red-500': profile.photos_opt_out
          }">
          Photos Opt Out:
          {{ profile.photos_opt_out ? 'YES' : 'NO' }}
        </p>
        <p
          :class="{
            'text-green-500': profile.cvUploaded,
            'text-red-500': !profile.cvUploaded
          }">
          CV uploaded:
          {{ profile.cvUploaded ? 'YES' : 'NO' }}
        </p>
      </div>
    </template>
  </UCard>
  <div>
    <p v-if="profile" class="mt-1 w-full text-center text-sm text-gray-500">
      UserID: {{ profile.id }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import type { Profile } from '~~/shared/types';

type Props = {
  profile: Profile;
};
defineProps<Props>();
</script>

<style></style>
