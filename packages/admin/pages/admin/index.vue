<script lang="ts" setup>
const { getRegistrationStats } = useProfile();
const { value: registrationStats } = await getRegistrationStats();
const calculateStats = (stats: {
  registered_users: number;
  all_users: number;
}) => [stats.registered_users, stats.all_users - stats.registered_users];
const hackerStats = calculateStats(registrationStats!.hacker);
const volunteerStats = calculateStats(registrationStats!.volunteer);
const adminStats = calculateStats(registrationStats!.admin);

definePageMeta({
  middleware: ['require-auth'],
  layout: 'admin'
});
useHead({
  title: 'Admin Dashboard'
});
</script>

<template>
  <h2 class="pt-12 text-center text-5xl font-semibold">Admin Dashboard</h2>

  <div class="mx-8 mt-8 grid grid-cols-3">
    <UCard class="col-span-2 row-span-2">
      <div class="grid grid-cols-2 gap-4">
        <h3 class="col-span-2 text-center text-3xl">Registration Statistics</h3>

        <PieChart
          title="Hacker Stats"
          :labels="['Registered', 'Non-registered']"
          :data="hackerStats"
          :color="['#0060E6', '#D62D3B']" />

        <PieChart
          title="Volunteer Stats"
          :labels="['Registered', 'Non-registered']"
          :data="volunteerStats"
          :color="['#0060E6', '#D62D3B']" />

        <PieChart
          title="Admin Stats"
          :labels="['Registered', 'Non-registered']"
          :data="adminStats"
          :color="['#0060E6', '#D62D3B']" />
      </div>
    </UCard>
  </div>
</template>
