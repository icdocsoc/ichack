<template>
  <NuxtLayout name="admin">
    <UContainer class="relative max-h-full overflow-y-scroll">
      <h2 class="text-center text-5xl font-semibold">Manage Teams</h2>
      <UForm @submit="handleSearchTeams" :state="formState">
        <UFormGroup label="Search By" name="searchType">
          <URadioGroup
            v-model="formState.searchType"
            :options="searchOptions" />
        </UFormGroup>
        <UFormGroup :label="queryLabel" name="query">
          <UInput v-model="formState.query" :placeholder="queryPlaceholder" />
        </UFormGroup>
        <UButton type="submit">Search</UButton>
      </UForm>
      <UTable
        :rows="results"
        :columns="columns"
        :loading="status == 'pending'"
        :single-select="true"
        @select="handleSelectTeamRow"></UTable>
    </UContainer>
    <USlideover v-model="isOpen">
      <div class="flex-1 p-4">
        <UButton
          color="gray"
          variant="ghost"
          size="sm"
          icon="i-heroicons-x-mark-20-solid"
          class="absolute end-5 top-5 z-10 flex sm:hidden"
          square
          padded
          @click="isOpen = false" />
        <div
          class="flex items-center justify-between border-b border-gray-300 p-4">
          <h2>{{ teamData?.teamName ?? 'team name...' }}</h2>
          <UButton @click="isOpen = false">Close</UButton>
        </div>
        <div class="p-4">
          <div class="mb-4 rounded-lg border border-gray-300 p-4">
            <div class="space-y-2">
              <p>
                <strong>Sponsor Category:</strong>
                {{ teamData?.sponsorCategory ?? 'Not Chosen!' }}
              </p>
              <p>
                <strong>Docsoc Category:</strong>
                {{ teamData?.docsocCategory ?? 'Not Chosen!' }}
              </p>
              <div>
                <strong>Submission Link:</strong>
                <a
                  v-if="teamData?.submissionLink"
                  :href="teamData.submissionLink"
                  class="text-blue-400 underline">
                  Submission Link
                </a>
                <p v-else>Does not exist :/</p>
              </div>
              <p>
                <strong>Phone:</strong>
                {{ teamData?.phone ?? 'Does not exist :/' }}
              </p>
              <p>
                <strong>Phone 2:</strong>
                {{ teamData?.phone2 ?? 'Does not exist :/' }}
              </p>
            </div>
          </div>
          <div class="mb-4 rounded-lg border border-gray-300 p-4">
            <h3>Members</h3>
            <p v-if="!members">No members!</p>
            <ul v-else>
              <li
                class="group flex items-center justify-between"
                v-for="member in members"
                :key="member.userId">
                <div>
                  <span v-if="member.isLeader" class="mr-2">👑</span>
                  <span>{{ member.memberName }}</span>
                </div>
                <div class="flex gap-2">
                  <UButton
                    @click="kickMember(member.userId)"
                    color="red"
                    class="hidden text-white group-hover:inline-block">
                    Kick
                  </UButton>
                  <UButton
                    v-if="!member.isLeader"
                    @click="transferLeader(member.userId)"
                    class="hidden text-white group-hover:inline-block">
                    Transfer
                  </UButton>
                </div>
              </li>
            </ul>
          </div>
          <div class="mb-4 rounded-lg border border-gray-300 p-4">
            <h3>Invites</h3>
            <p v-if="!invites">No Invites!</p>
            <ul v-else>
              <li
                class="group flex items-center justify-between"
                v-for="invite in invites"
                :key="invite.userId">
                <span>{{ invite.invitedUserName }}</span>
                <div class="flex gap-2">
                  <UButton
                    @click="removeInvite(invite.userId)"
                    color="red"
                    class="hidden text-white group-hover:inline-block">
                    Remove
                  </UButton>
                  <UButton
                    @click="acceptInvite(invite.userId)"
                    class="hidden text-white group-hover:inline-block">
                    Accept Invite
                  </UButton>
                </div>
              </li>
            </ul>
          </div>
          <div>
            <SearchBar v-model="chosenUser" />
            <UButton :disabled="members.length === 6" @click="addUser">
              Add Member
            </UButton>
          </div>
        </div>
      </div>
    </USlideover>
  </NuxtLayout>
  <UNotifications />
</template>

<script lang="ts" setup>
import type {
  TeamIdName,
  TeamMember,
  TeamInvite,
  UserTeamStatus,
  Team,
  Profile as UserProfile
} from '#shared/types';

const searchOptions = [
  { label: 'Team Name', value: 'teamName' },
  { label: 'User Name', value: 'userName' }
];

const formState = reactive<{
  searchType: 'teamName' | 'userName';
  query: string;
}>({
  searchType: 'teamName',
  query: ''
});
const results = ref<TeamIdName[] | UserTeamStatus[]>([]);
const selected = ref<TeamIdName | UserTeamStatus>();
const status = ref<'idle' | 'pending' | 'error' | 'success'>('idle');

const queryLabel = computed(() => {
  switch (formState.searchType) {
    case 'teamName':
      return 'Team Name';
    case 'userName':
      return 'User Name';
  }
});
const queryPlaceholder = computed(() => {
  switch (formState.searchType) {
    case 'teamName':
      return 'Enter team name';
    case 'userName':
      return 'Enter user name';
  }
});

const columns = computed(() => {
  if (formState.searchType == 'teamName') {
    return [
      { key: 'teamName', label: 'Team Name' },
      { key: 'teamId', label: 'Team ID' }
    ];
  }

  return [
    { key: 'userId', label: 'User ID' },
    { key: 'userName', label: 'User Name' },
    { key: 'teamName', label: 'Team Name' },
    { key: 'teamId', label: 'Team ID' },
    { key: 'status', label: 'Status' }
  ];
});

const handleSearchTeams = async () => {
  status.value = 'pending';
  const result =
    formState.searchType == 'teamName'
      ? await searchTeamsByName(formState.query)
      : await searchTeamsByUser(formState.query);

  if (result.isError()) {
    errorToast(result.error ?? new Error('An unknown error occurred'));
    status.value = 'error';
    return;
  }

  results.value = result.value!;
  status.value = 'success';
};

const handleSelectTeamRow = async (row: TeamIdName | UserTeamStatus) => {
  selected.value = row;
  isOpen.value = true;
  await fetchTeamDetails();
};

const {
  getTeamDetails,
  sudoRemoveUser,
  sudoRemoveInvite,
  sudoTransferTeam,
  sudoAcceptInvite,
  sudoAddUser,
  searchTeamsByName,
  searchTeamsByUser,
  sudoDisbandTeam
} = useTeams();

const toast = useToast();

const teamData = ref<Team>();
const members = ref<TeamMember[]>([]);
const invites = ref<TeamInvite[]>([]);
const isOpen = ref(false);
const chosenUser = ref<UserProfile>();

function errorToast(error: Error) {
  toast.add({
    title: error?.name ?? 'Error',
    description: error?.message ?? 'An unkown error occurred',
    timeout: 2000,
    icon: 'i-heroicons-exclamation-triangle-16-solid',
    color: 'red'
  });
}

const successToast = (message: string) => {
  toast.add({
    title: 'Success',
    description: message,
    timeout: 2000,
    icon: 'i-heroicons-check-circle-16-solid',
    color: 'green'
  });
};

const fetchTeamDetails = async () => {
  if (!selected.value) return errorToast(new Error('No team selected'));
  const result = await getTeamDetails(selected.value.teamId.toString());
  if (result.isError())
    return errorToast(result.error ?? new Error('An unknown error occurred'));

  const data = result.value!;
  teamData.value = {
    ...data.teamData,
    phone: data.teamData.phone ?? undefined,
    phone2: data.teamData.phone2 ?? undefined
  };
  members.value = data.members;
  invites.value = data.invites;
};

function findLeader() {
  return members.value.find(member => member.isLeader);
}

const kickMember = async (userId: string) => {
  const leader = findLeader()?.userId ?? '';

  if (leader == userId) {
    if (!confirm('Are you sure you want to disband this team?')) return;
    await sudoDisbandTeam(leader);

    await handleSearchTeams();
    isOpen.value = false;

    return successToast(`Disbanded team lead by ${leader}`);
  }

  const res = await sudoRemoveUser(leader, userId);
  if (res.isError())
    return errorToast(res?.error ?? new Error('An unknown error occurred'));

  await fetchTeamDetails();
  successToast(`User with id ${userId} removed successfully`);
};

const acceptInvite = async (userId: string) => {
  const res = await sudoAcceptInvite(selected.value?.teamId ?? -1, userId);
  if (res.isError())
    return errorToast(res?.error ?? new Error('An unknown error occurred'));

  await fetchTeamDetails();
  successToast(`User with id ${userId} accepted successfully`);
};

const addUser = async () => {
  if (!chosenUser.value) errorToast(new Error('Warning not linked'));
  if (!selected.value) return errorToast(new Error('No team selected'));
  const leader = findLeader();
  if (!leader) return errorToast(new Error('No leader available (uhoh)'));

  const res = await sudoAddUser(
    /* userId = */ chosenUser.value!.id,
    /* teamId = */ selected.value.teamId
  );
  if (res.isError())
    return errorToast(res?.error ?? new Error('An unknown error occurred'));

  await fetchTeamDetails();
  successToast(`User with id ${chosenUser.value?.id ?? ''} added successfully`);
};

const removeInvite = async (userId: string) => {
  const res = await sudoRemoveInvite(selected.value?.teamId ?? -1, userId);
  if (res.isError())
    return errorToast(res?.error ?? new Error('An unknown error occurred'));

  await fetchTeamDetails();
  successToast(`Invitee with id ${userId} removed successfully`);
};

const transferLeader = async (newLeaderId: string) => {
  const currentLeader = findLeader();
  if (!currentLeader) return errorToast(new Error('No leader aviailable uhoh'));

  const res = await sudoTransferTeam(currentLeader.userId, newLeaderId);
  if (res.isError())
    return errorToast(res?.error ?? new Error('An unknown error occurred'));

  await fetchTeamDetails();
  successToast(`Team leader transferred to user with id ${newLeaderId}`);
};

definePageMeta({
  middleware: 'require-auth'
});
useHead({
  title: 'Teams'
});
</script>
