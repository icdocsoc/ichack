<script lang="ts" setup>
// User statistics information
const { getRegistrationStats } = useProfile();
const { value: registrationStats } = await getRegistrationStats();
const calculateStats = (stats: {
  registered_users: number;
  all_users: number;
}) => [stats.registered_users, stats.all_users - stats.registered_users];
const hackerStats = calculateStats(registrationStats!.hacker);
const volunteerStats = calculateStats(registrationStats!.volunteer);
const adminStats = calculateStats(registrationStats!.admin);

// Meal setting and getting
const NO_MEAL = -1;
const mealOptions = [
  {
    name: 'No meal',
    value: NO_MEAL
  },
  {
    name: 'Saturday Lunch',
    value: 0
  },
  {
    name: 'Saturday Dinner',
    value: 1
  },
  {
    name: 'Sunday Lunch',
    value: 2
  }
];
const { getMetaDataInfo, setMealNumber, setCanSubmit } = useAdmin();
const { data: metaInfo, error: gettingMealError } = await useAsyncData(
  'getMealNumber',
  async () => {
    const result = await getMetaDataInfo();
    return result.getOrThrow();
  }
);
const selectedMealNumber = ref(metaInfo.value?.mealNumber || NO_MEAL);
const handleSetMeal = async () => {
  const confirm = window.confirm(
    `Set the meal to '${mealOptions[selectedMealNumber.value + 1]?.name}'?`
  );
  if (!confirm) return;

  const result = await setMealNumber(selectedMealNumber.value);
  if (result.isError()) {
    alert('Failed to set meal number');
  } else {
    alert('Successfully set meal number');
  }
};

const canSubmit = ref(metaInfo.value?.allowSubmissions || false);
const handleUpdateSubmissions = async () => {
  const confirm = window.confirm(
    `Set the allow submissions to '${!canSubmit.value}'?`
  );
  if (!confirm) return;

  const result = await setCanSubmit(!canSubmit.value);
  if (result.isError()) {
    alert('Failed to update submissions');
  } else {
    alert('Successfully updated submissions');
    canSubmit.value = !canSubmit.value;
  }
};

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

  <div class="mx-8 mt-8 grid grid-cols-3 gap-4">
    <UCard class="col-span-3">
      <div class="grid grid-cols-3 gap-4">
        <h3 class="col-span-3 text-center text-3xl">Registration Statistics</h3>

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
    <UCard>
      <div class="flex flex-col gap-2">
        <h3 class="text-center text-3xl">Meals</h3>
        <p>
          Ongoing Meal:
          <UBadge :color="metaInfo?.mealNumber == NO_MEAL ? 'red' : 'green'">
            {{
              mealOptions.find(option => option.value === metaInfo?.mealNumber)
                ?.name || 'Unknown Meal'
            }}
          </UBadge>
        </p>

        <div class="flex gap-4">
          <USelect
            v-model="selectedMealNumber"
            :options="mealOptions"
            option-attribute="name" />

          <UButton @click="handleSetMeal"> Set Meal </UButton>
        </div>
      </div>
    </UCard>
    <NuxtLink to="/admin/categories">
      <UCard>
        <div class="flex flex-col gap-2">
          <h3 class="text-center text-3xl">Categories</h3>
          <div class="flex justify-between">
            <p>
              Are visible?
              <UBadge :color="metaInfo?.showCategories ? 'green' : 'red'">
                {{ metaInfo?.showCategories ? 'Yes' : 'No' }}
              </UBadge>
            </p>
          </div>
        </div>
      </UCard>
    </NuxtLink>

    <UCard>
      <h3 class="text-center text-3xl">Teams Can Submit</h3>
      <UBadge
        class="cursor-pointer"
        :color="canSubmit ? 'green' : 'red'"
        @click="handleUpdateSubmissions">
        {{ canSubmit ? 'Yes' : 'No' }}
      </UBadge>
    </UCard>
  </div>
</template>
