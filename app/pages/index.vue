<script setup lang="ts">
import qtr from '@ui25/assets/qtr_blue.svg';
import scr from '@ui25/assets/scr_red.svg';
import jcr from '@ui25/assets/jcr_yellow.svg';
const { getJudging } = useCategories();

const showAdminButtons = ref(false);
const store = useProfileStore();

const showJoinHackspace = ref(false);

const showJudging = ref(false);
const { data: judgingData, refresh: refreshJudging } = useAsyncData(
  'get_judging_categories',
  async () => {
    const result = await getJudging();
    return result.getOrThrow();
  }
);

onMounted(() => {
  const intervalId = setInterval(async () => {
    await refreshJudging();
  }, 10000);

  onBeforeUnmount(() => {
    clearInterval(intervalId);
  });
});

const showHackspaceScores = ref(true);

const showSchedule = ref(false);
const { data: events } = useAsyncData('get_all_events', async () => {
  const { getEvents } = useEvents();
  const result = await getEvents();
  const events = result.getOrThrow();
  const now = new Date();
  return events.filter(event => new Date(event.startsAt) > now);
});

const showCategories = ref(false);
const { data: categories } = useAsyncData('get_all_categories', async () => {
  const { getAllCategories } = useCategories();
  const result = await getAllCategories();
  return result.getOrThrow();
});
const backgroundColors = ['bg-red-ic', 'bg-yellow-ic', 'bg-blue-ic'];

definePageMeta({
  middleware: ['require-auth', 'require-link']
});
useHead({
  title: 'Hacker Dashboard'
});
</script>

<template>
  <div class="flex flex-col gap-5 pb-10">
    <NuxtLink to="/profile" class="lg:hidden">
      <DashboardHackspaceButton room="Go to your Profile" logo="" />
    </NuxtLink>
    <NuxtLink to="/team" class="lg:hidden">
      <DashboardHackspaceButton room="Go to your Team" logo="" />
    </NuxtLink>

    <div v-if="store.profile?.role !== 'hacker'">
      <DashboardButton v-model="showAdminButtons" background="bg-red-ic">
        Admin Panels
      </DashboardButton>
      <div
        v-if="showAdminButtons"
        class="mt-4 flex justify-between gap-4 pb-4 max-lg:flex-col">
        <NuxtLink
          v-if="store.profile?.role !== 'volunteer'"
          to="/admin"
          class="w-full">
          <DashboardHackspaceButton
            room="Admin Panel"
            :logo="jcr"
            class="w-full" />
        </NuxtLink>
        <NuxtLink to="/volunteer" class="w-full">
          <DashboardHackspaceButton
            room="Volunteer Panel"
            :logo="jcr"
            class="w-full" />
        </NuxtLink>
      </div>
    </div>

    <!-- <div>
      <DashboardButton background="bg-red-ic" v-model="showJoinHackspace">
        Join a Hackerspace
      </DashboardButton>
      <div
        class="mt-4 flex justify-between gap-4 pb-4 max-lg:flex-col"
        v-if="showJoinHackspace">
        <DashboardHackspaceButton
          room="Junior Common Room"
          :logo="jcr"
          class="w-full" />
        <DashboardHackspaceButton
          room="Senior Common Room"
          :logo="scr"
          class="w-full" />
        <DashboardHackspaceButton
          room="Queen's Tower Rooms"
          :logo="qtr"
          class="w-full" />
      </div>
    </div> -->

    <div>
      <DashboardButton background="bg-red-ic" v-model="showHackspaceScores">
        Hackspace Leaderboard
      </DashboardButton>
      <DashboardHackspace v-if="showHackspaceScores" class="mt-10 w-full" />
    </div>

    <div v-if="judgingData">
      <DashboardButton background="bg-blue-ic" v-model="showJudging">
        Judging
      </DashboardButton>
      <div class="flex items-center gap-5" v-if="showJudging">
        <div v-for="category in judgingData" :key="category.title">
          <JudgingCategory
            :title="category.title"
            :slug="category.slug"
            v-model="category.hackspace"
            :isAdmin="false" />
        </div>
      </div>
    </div>

    <div>
      <DashboardButton v-model="showSchedule" background="bg-yellow-ic">
        <div class="flex min-w-max flex-col items-start">
          <p>Schedule</p>
          <p class="text-lg font-normal" v-if="events?.[0]">
            Up Next: {{ events?.[0]?.title }}
          </p>
        </div>
      </DashboardButton>
      <div class="flex" v-if="showSchedule && events">
        <DashboardSchedule
          class="relative mt-4 w-full max-w-[60lvw]"
          :events="events!" />
        <img
          src="@ui25/assets/ducks.svg"
          class="mx-auto my-5 h-20 self-center px-3 max-lg:hidden" />
      </div>
    </div>

    <div>
      <DashboardButton
        v-if="categories"
        background="bg-blue-ic"
        v-model="showCategories">
        Explore Categories
      </DashboardButton>
      <div
        class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3"
        v-if="showCategories && categories">
        <CategoryCard
          v-for="(category, index) in categories"
          :key="category.slug"
          :background="backgroundColors[index % 3]!"
          :category="category" />
      </div>
    </div>
  </div>
</template>
