<template>
  <div>
    <div class="flex flex-row justify-between pb-5">
      <h2 class="text-lg font-semibold">Notifications</h2>
    </div>

    <!-- Notif list -->
    <div class="flex w-full flex-col gap-2 text-lg">
      <div
        v-if="!error"
        v-for="announcement in sortedAnnouncements"
        :key="announcement.id"
        @click="viewAnnouncement(announcement!.id)"
        :class="{
          'flex place-content-between border-[1px] border-white bg-black p-2 text-white hover:cursor-pointer': true,
          'bg-white !text-black': announcement.id === selected
        }">
        <p>{{ announcement.title }}</p>
        <p
          v-if="
            announcement.pinUntil &&
            announcement.pinUntil > new Date(Date.now())
          ">
          📌
        </p>
      </div>
      <div v-else>Error fetching announcements!</div>
    </div>
  </div>

  <ICError v-model="uiError" />
</template>

<script lang="ts" setup>
const selected = ref(-1);
const { getAnnouncements } = useAnnouncements();
const uiError = ref('');

const { data, refresh, error } = await useAsyncData(
  'announcements',
  async () => {
    const res = await getAnnouncements();
    if (res.isError()) {
      uiError.value = res.error.message;
    } else {
      return res.value ?? [];
    }
  }
);

const sortedAnnouncements = computed(() => {
  if (!data.value) return [];

  const now = new Date(Date.now());

  return data.value.sort((a, b) => {
    // Compare pin status first
    if (a.pinUntil && b.pinUntil) {
      if (a.pinUntil >= now && b.pinUntil < now) return -1;
      if (a.pinUntil < now && b.pinUntil >= now) return 1;
    } else if (a.pinUntil && a.pinUntil >= now) return -1;
    else if (b.pinUntil && b.pinUntil >= now) return 1;

    // Then sort by ID in descending order
    return (b.id ?? 0) - (a.id ?? 0);
  });
});

onMounted(async () => {
  setInterval(async () => {
    await refresh();
  }, 10000);
});

const route = useRoute();

watch(route, () => {
  if (route.path.startsWith('/announcements')) {
    selected.value = +route.path.split('/').pop()!;
  } else {
    selected.value = -1;
  }
});

const viewAnnouncement = (id: number | undefined) => {
  if (!id) return;
  navigateTo('/announcements/' + id);
};
</script>
