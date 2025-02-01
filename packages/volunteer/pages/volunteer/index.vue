<template>
  <h1 class="font-archivo mb-5 text-center text-3xl">
    Welcome, {{ name ?? 'null' }}!
  </h1>
  <div
    class="flex h-screen flex-col items-center justify-start space-y-2 text-center">
    <div class="w-full">
      <h2 class="font-ichack mb-5 w-full text-2xl">Qr Code</h2>
      <UButton
        color="blue"
        @click="goToScanner(Scanfor.REGISTER)"
        class="font-ichack text-1xl mb-5 w-full"
        text>
        <p class="w-full">Register User</p></UButton
      >
      <UButton
        @click="goToScanner(Scanfor.MEAL)"
        class="font-ichack text-1xl mb-5 w-full"
        :disabled="!mealsOn"
        text>
        <p class="w-full">Meal Check in</p></UButton
      >

      <!-- Events Section -->
      <UButton
        @click="goToScanner(Scanfor.EVENT)"
        class="font-ichack text-1xl mb-5 w-full"
        text
        ><p class="w-full">Event Check in</p></UButton
      >
      <UButton
        @click="goToScanner(Scanfor.PROFILE)"
        class="font-ichack text-1xl mb-5 w-full"
        text
        ><p class="w-full">Profile Lookup</p></UButton
      >
      <h2 class="font-ichack mb-5 w-full text-center text-lg">
        Lookup a user by name
      </h2>
      <SearchBar class="mb-3" v-model="userLookUp" />
      <ProfileCard v-if="userLookUp" :profile="userLookUp" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Profile, Scanfor } from '~~/shared/types';
import SearchBar from '../../components/SearchBar.vue';

definePageMeta({
  middleware: [
    'require-auth',
    function checkHacker() {
      const store = useProfileStore();
      if (store.profile!.role === 'hacker') {
        return navigateTo('/');
      }
    }
  ]
});
useHead({
  title: 'Volunteer Dashboard'
});

const { profile } = useProfileStore();
const { getMetaDataInfo } = useAdmin();

const goToScanner = async (item: Scanfor) => {
  navigateTo({
    path: '/volunteer/scan',
    query: { scanFor: item }
  });
};

const userLookUp = ref<Profile>();
const name = computed(() => profile?.name.split(' ')[0]);
const mealsOn = ref<boolean>(true);
onMounted(async () => {
  const metaData = await getMetaDataInfo();
  if (metaData.isOk()) {
    mealsOn.value = metaData.value.mealNumber > -1;
  }
});
</script>
