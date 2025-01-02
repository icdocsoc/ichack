<script setup lang="ts">
import { roles } from '#shared/types';
import { z } from 'zod';

// UI related properties
const isAddUserPopupOpen = ref(false);
const tableColumns = [
  {
    key: 'id',
    label: 'Id'
  },
  {
    key: 'name',
    label: 'Name'
  },
  {
    key: 'email',
    label: 'Email'
  },
  {
    key: 'role',
    label: 'Role'
  },
  {
    key: 'actions'
  }
];

// List of users related properties
const { getProfiles, getSelf } = useProfile();
const { deleteUser, createUser } = useAdmin();
const { profile } = useProfileStore();
const { data, refresh, status, error } = await useAsyncData(
  'users',
  async () => {
    const res = await getProfiles();
    if (res.isError()) {
      console.log(res.error);
    } else {
      return res.getOrNull();
    }
  }
);
const roleItems = computed(() => {
  return [
    roles.map(role => ({
      label: role,
      click: () => (userDetails.role = role)
    }))
  ];
});

// Actions on users
// const deleteUser = async (id: string) => {
//   const result = await deleteUser(id);
//   result.fold(
//     _ => refresh(),
//     error => console.error(error)
//   );
// };
const goToUserPage = (id: string) => {
  navigateTo(`/users/${id}`);
};

// Create User form related properties
const schema = z.object({
  name: z.string().min(1),
  email: z.string().email('Invalid email address'),
  role: z.enum(['volunteer', 'organizer', 'admin'])
});
const userDetails: CreateUserDetails = reactive({
  name: '',
  email: '',
  role: 'volunteer'
});
async function handleSubmit() {
  // Do something with data
  const response = await createUser(userDetails);
  if (response.isError()) {
    console.error(error);
    return;
  }

  refresh();

  // resetting the userDetails object
  userDetails.name = '';
  userDetails.email = '';

  // closing the popup modal
  isAddUserPopupOpen.value = false;
}

// Other misc things
definePageMeta({
  middleware: ['require-auth']
});
</script>

<template>
  <NuxtLayout name="toolbar">
    <UContainer class="relative max-h-full overflow-y-scroll">
      <h2 class="text-center text-5xl font-semibold">Manage Users</h2>
      <UButton
        label="Add User"
        @click="isAddUserPopupOpen = true"
        v-if="profile!.role == 'god'" />
      <UAlert v-if="error" :title="error.message" />
      <UTable
        v-else
        :rows="data!"
        :columns="tableColumns"
        :loading="status == 'pending'">
        <template #actions-data="{ row }">
          <UButton
            icon="i-heroicons-pencil-square"
            size="xs"
            color="primary"
            square
            variant="outline"
            class="mx-2"
            @click="" />
          <UButton
            icon="i-heroicons-solid-user-remove"
            size="xs"
            color="primary"
            square
            variant="outline"
            class="mx-2"
            @click="" />
        </template>
      </UTable>
      <UModal v-model="isAddUserPopupOpen">
        <UContainer class="mb-4 grid grid-flow-row justify-center p-10">
          <UForm
            :schema="schema"
            :state="userDetails"
            class="p-4"
            @submit="handleSubmit">
            <UFormGroup label="Name" name="name">
              <UInput v-model="userDetails.name" />
            </UFormGroup>
            <UFormGroup label="Email" name="email">
              <UInput v-model="userDetails.email" />
            </UFormGroup>
            <UFormGroup label="Role" name="role" class="justify-center p-1">
              <DropdownInput v-model="userDetails.role" :items="roleItems" />
            </UFormGroup>
            <UButton type="submit" class="justify-center p-4">Submit</UButton>
          </UForm>
        </UContainer>
      </UModal>
    </UContainer>
  </NuxtLayout>
</template>
