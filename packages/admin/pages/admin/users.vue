<script setup lang="ts">
import type { Profile } from '#shared/types';

// UI related properties
const tableColumns = [
  {
    key: 'name',
    label: 'Name'
  },
  {
    key: 'id',
    label: 'Id'
  },
  {
    key: 'email',
    label: 'Email'
  },
  {
    key: 'registered',
    label: 'Registered'
  },
  {
    key: 'linked',
    label: 'Linked QR'
  }
];
const badgeColors = {
  god: 'amber',
  admin: 'blue',
  volunteer: 'emerald',
  hacker: 'gray'
} as const;

const mealItems = [
  { label: 'meal 0', value: 0 },
  { label: 'meal 1', value: 1 },
  { label: 'meal 2', value: 2 }
];

// there's a nuxt ui bug which returns a thing whose actual type is a string
// even though the USelect API is says it's gonna be a number, since the
// value in mealItems above says it's going to be a number. But it's not. this language sucks ass.
const selectedMealNum = ref<number>(0);

// Admin/God self profile
const { data: selfProfile } = useAsyncData<Profile>('selfProfile', async () => {
  const { getSelf } = useProfile();
  const res = await getSelf();
  return res.getOrThrow();
});

// List of all users related properties
const { data, status, error } = await useAsyncData<FlatUserProfile[]>(
  'users',
  async () => {
    const { getProfiles } = useProfile();
    const res = await getProfiles();
    return res.getOrThrow();
  }
);

// Search related properties
const searchFilter = ref<string>('');
const filteredUsers = computed(() => {
  if (!data.value) return [];

  if (!searchFilter.value) return data.value!;

  return data.value!.filter(
    user =>
      user.name.toLowerCase().includes(searchFilter.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchFilter.value.toLowerCase()) ||
      user.id === searchFilter.value
  );
});

// Manage & Select User related properties
const selectedUser = ref<FlatUserProfile | null>(null);
const showUserDetails = ref<boolean>(false);
const handleSelect = (profile: FlatUserProfile) => {
  console.log(profile); // for admin, it is fine to have this.
  selectedUser.value = profile;
  showUserDetails.value = true;
};

// Individual User Actions
const unlinkQRCode = async (user: FlatUserProfile) => {
  const { deleteQR } = useQR();
  const result = await deleteQR(user.id);
  if (result.isError()) {
    return alert(result.error.message);
  }
};

const unsetMeal = async (user: FlatUserProfile) => {
  const { unsetMeal } = useProfile();
  const result = await unsetMeal(user.id, selectedMealNum.value);
  if (result.isError()) {
    return alert(result.error.message);
  } else {
    return alert(`Meal ${selectedMealNum.value} unset succesfully`);
  }
};

const deleteCV = async (user: FlatUserProfile) => {
  const { deleteCV } = useProfile();
  const result = await deleteCV(user.id);
  if (result.isError()) {
    return alert(result.error.message);
  } else {
    return alert('CV deleted');
  }
};

const sendResetPassword = async (user: FlatUserProfile) => {
  const { forgotPassword } = useAuth();
  const result = await forgotPassword(user.email);
  if (result.isError()) {
    return alert(result.error.message);
  } else {
    return alert('Reset password link sent successfully');
  }
};

// Other misc things
definePageMeta({
  middleware: ['require-auth'],
  layout: 'admin'
});
useHead({
  title: 'Admin - Users'
});
</script>

<template>
  <UContainer class="relative mt-12 max-h-full overflow-y-scroll">
    <h2 class="text-center text-5xl font-semibold">Manage Users</h2>

    <div
      class="mt-8 flex border-b border-gray-200 px-3 py-3.5 dark:border-gray-700">
      <UInput
        v-model="searchFilter"
        class="min-w-[240px]"
        placeholder="Search by name, ID or email..." />
    </div>

    <UAlert v-if="error" :title="error.message" />
    <UTable
      v-else
      :rows="filteredUsers"
      :columns="tableColumns"
      @select="handleSelect"
      :loading="status == 'pending'"
      :ui="{ th: { size: 'text-lg' } }">
      <template #name-data="{ row }: { row: FlatUserProfile }">
        <span class="flex items-center gap-2">
          <p>{{ row.name }}</p>
          <UBadge :color="badgeColors[row.role]" variant="solid">
            {{ row.role }}
          </UBadge>
        </span>
      </template>

      <template #registered-data="{ row }: { row: FlatUserProfile }">
        <UBadge :color="row.isRegistered ? 'green' : 'red'" variant="solid">
          {{ row.isRegistered ? 'Yes' : 'No' }}
        </UBadge>
      </template>

      <template #linked-data="{ row }: { row: FlatUserProfile }">
        <UBadge :color="row.hasLinkedQR ? 'green' : 'red'" variant="solid">
          {{ row.hasLinkedQR ? 'Yes' : 'No' }}
        </UBadge>
      </template>
    </UTable>

    <USlideover v-model="showUserDetails">
      <div class="flex w-full flex-col items-start gap-4 p-4">
        <h2 class="self-center text-2xl font-bold">
          {{ selectedUser!.name }}
        </h2>

        <div>
          <h3 class="text-lg font-semibold">Details</h3>
          <ul class="ml-4 list-inside list-disc">
            <li>
              <span class="font-semibold">ID:</span> {{ selectedUser!.id }}
            </li>
            <li>
              <span class="font-semibold">Email:</span>
              {{ selectedUser!.email }}
            </li>
            <li>
              <span class="font-semibold">Role:</span> {{ selectedUser!.role }}
            </li>
            <li>
              <span class="mr-0.5 font-semibold">Registered: </span>
              <UBadge
                :color="selectedUser!.isRegistered ? 'green' : 'red'"
                variant="solid">
                {{ selectedUser!.isRegistered ? 'Yes' : 'No' }}
              </UBadge>
            </li>
          </ul>
        </div>

        <UDivider />

        <div v-if="selectedUser!.isRegistered">
          <h3 class="text-lg font-semibold">Other Details</h3>
          <ul class="ml-4 list-inside list-disc">
            <li>
              <span class="font-semibold">Photos Opt Out: </span>
              {{ selectedUser!.photosOptOut ? 'Yes' : 'No' }}
            </li>
            <li>
              <span class="font-semibold">Dietary Restrictions: </span>
              {{
                selectedUser!.dietaryRestrictions?.join(',') ??
                'Dietary Restrictions is null'
              }}
            </li>
            <li>
              <span class="font-semibold">Pronouns: </span>
              {{ selectedUser!.pronouns }}
            </li>
            <li>
              <span class="font-semibold">Meals: </span>
              {{ selectedUser!.meals?.join(',') ?? 'Meals array is null' }}
            </li>
            <li>
              <span class="font-semibold">CV Uploaded: </span>
              {{ selectedUser!.cvUploaded ? 'Yes' : 'No' }}
            </li>
          </ul>

          <UDivider class="mt-4" />
        </div>

        <div v-if="selectedUser!.hasLinkedQR">
          <h3 class="text-lg font-semibold">QR Code Linked!</h3>
          <ul class="ml-4 list-inside list-disc">
            <li>
              <span class="font-semibold">UUID: </span>
              {{ selectedUser!.qrUuid ?? 'UUID is undefined' }}
            </li>
          </ul>

          <UButton
            color="red"
            v-if="selfProfile?.role == 'god'"
            @click="unlinkQRCode(selectedUser!)">
            Unlink QR Code
          </UButton>

          <UDivider class="mt-4" />
        </div>

        <div>
          <h3 class="text-lg font-semibold">Other Actions</h3>
          <div class="mt-2 flex flex-wrap gap-4">
            <UButton @click="sendResetPassword(selectedUser!)">
              Send Reset Password
            </UButton>
            <UButton @click="unsetMeal(selectedUser!)"> Unset meal: </UButton>
            <USelect v-model="selectedMealNum" :options="mealItems"></USelect>
            <UButton @click="deleteCV(selectedUser!)">Delete CV</UButton>
          </div>
        </div>
      </div>
    </USlideover>
  </UContainer>
</template>
