<script setup lang="ts">
import { type CreateUserDetails, roles } from '@shared/types';
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
const roleItems = computed(() =>
  roles.map(role => ({
    label: role as string,
    click() {
      userDetails.role = role;
    }
  }))
);

// List of users related properties
const { authRepo, profileRepo } = useRepositories();
const { user } = useUserStore();
const { data, refresh, status, error } = await useAsyncResult('users', () =>
  profileRepo.getUsers()
);

// Actions on users
const deleteUser = async (id: string) => {
  const result = await authRepo.deleteUser(id);
  result.fold(
    _ => refresh(),
    error => console.error(error)
  );
};
const goToUserPage = (id: string) => {
  navigateTo(`/users/${id}`);
};

// Create User form related properties
const schema = z.object({
  name: z.string().min(1),
  email: z.string().email('Invalid email address'),
  role: z.enum(roles)
});
const userDetails: CreateUserDetails = reactive({
  name: '',
  email: '',
  role: 'volunteer'
});
async function handleSubmit() {
  // Do something with data
  const response = await authRepo.createUser(userDetails);
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
useTitle('Users');
</script>

<template>
  <NuxtLayout name="toolbar">
    <UContainer class="relative overflow-y-scroll max-h-full">
      <h2 class="font-semibold text-5xl text-center">Manage Users</h2>
      <UButton
        label="Add User"
        @click="isAddUserPopupOpen = true"
        v-if="user!.role == 'god'" />
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
        <UContainer class="mb-4 p-10 justify-center grid grid-flow-row">
          <UForm
            data-testid="form"
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
              <UDropdown :items="roleItems">
                <UButton
                  :label="userDetails.role"
                  trailing-icon="heroicons-chevron-down-20-solid" />
              </UDropdown>
            </UFormGroup>
            <UButton type="submit" class="justify-center p-4">Submit</UButton>
          </UForm>
        </UContainer>
      </UModal>
    </UContainer>
  </NuxtLayout>
</template>
