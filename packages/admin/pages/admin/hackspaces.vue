<template>
  <div class="flex flex-col items-center">
    <div>
      <div class="flex justify-center py-3" id="title">
        <h1 class="text-3xl font-bold">Hackspace Scores</h1>
      </div>
      <div class="flex justify-around">
        <div v-for="hackspace in hackspaces">
          <UBadge class="text-2xl" :color="getHackspaceColor(hackspace)">{{
            hackspace
          }}</UBadge>
          <p class="text-center text-lg">{{ points![hackspace] }}</p>
        </div>
      </div>
    </div>

    <div>
      <div class="flex justify-center py-3" id="title">
        <h1 class="text-3xl font-bold">Hackspace Challenges</h1>
      </div>
      <div class="w-full px-28 py-5 text-xl">
        <UButton
          size="lg"
          @click="addChallengeButtonHandler"
          class="text-lg"
          :disabled="addChallengeButtonDisabled"
          >{{ addChallengeButtonText }}</UButton
        >
        <div
          class="my-3 grid grid-cols-6 space-x-10 space-y-3 border-2 border-green-400 p-3"
          :class="newChallenge ? '' : 'hidden'">
          <div class="col-span-5 flex flex-col gap-y-3">
            <div class="grid grid-cols-6 space-x-6">
              <div class="col-span-4">Challenge name</div>
              <div class="col-span-1">Hackspace</div>
              <div class="col-span-1">Score</div>
            </div>
            <div class="grid grid-cols-6 items-center space-x-6">
              <UInput
                v-model="newChallengeData.name"
                class="col-span-4"
                size="xl"
                required></UInput>
              <div
                class="col-span-1 flex flex-col items-center justify-center space-y-3">
                <div v-for="hackspace in hackspaces">{{ hackspace }}</div>
              </div>
              <div
                class="col-span-1 flex flex-col items-center justify-center space-y-3">
                <UInput
                  v-for="hackspace in hackspaces"
                  v-model="newChallengeData[hackspace]"
                  class="col-span-1"
                  type="number"></UInput>
              </div>
            </div>
          </div>
          <div
            class="col-span-1 flex flex-col items-center justify-center gap-4">
            <UButton size="lg" @click="createChallengeHandler"
              >Save that shizz!</UButton
            >
            <UButton color="red" size="lg" @click="cancelCreateChallengeHandler"
              >On second thought...</UButton
            >
          </div>
        </div>
        <div class="my-3 flex flex-col space-y-3">
          <div
            class="my-3 grid grid-cols-6 space-x-10 space-y-3 border-2 p-3"
            :class="c.editing.value ? 'border-orange-600' : ''"
            v-for="(c, i) in challenges">
            <div class="col-span-5 grid grid-cols-6 items-center space-x-6">
              <div class="col-span-4">
                <div class="text-xl">{{ c.challenge.name }}</div>
                <p class="text-sm text-gray-400" v-if="c.editing.value">
                  Create a new challenge and delete this challenge if you would
                  like to change the name.
                </p>
              </div>
              <div
                class="col-span-1 flex flex-col items-center justify-center space-y-3">
                <div v-for="hackspace in hackspaces">{{ hackspace }}</div>
              </div>
              <div
                class="col-span-1 flex flex-col items-center justify-center space-y-3">
                <div
                  v-if="!c.editing.value"
                  v-for="hackspace in hackspaces"
                  class="col-span-1"
                  type="number">
                  {{ c.challenge[hackspace] }}
                </div>
                <UInput
                  v-else
                  v-for="hackspace in hackspaces"
                  v-model="c.challenge[hackspace]"
                  class="col-span-1"
                  type="number"></UInput>
              </div>
            </div>
            <div
              class="col-span-1 flex flex-col items-center justify-center gap-4">
              <UButton
                v-if="!c.editing.value"
                size="xl"
                color="orange"
                @click="c.editing.value = true"
                >Edit</UButton
              >
              <UButton v-else size="xl" color="green" @click="handleUpdate(i)">
                Submit
              </UButton>
              <UButton
                size="xl"
                color="red"
                @click="
                  () => {
                    deleteChallenge(i);
                  }
                "
                >{{
                  confirmDeleteChallenge[i] === true ? 'Sure?' : 'Delete'
                }}</UButton
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="w-4/5">
      <div class="flex justify-center py-3" id="title">
        <h1 class="text-3xl font-bold">User Hackspace Points</h1>
      </div>

      <div
        class="mt-8 flex border-b border-gray-200 px-3 py-3.5 dark:border-gray-700">
        <UInput
          v-model="searchFilter"
          class="min-w-[240px]"
          placeholder="Search by name, ID or email..." />
      </div>
      <UAlert v-if="usersError" :title="usersError.message" />
      <UTable
        v-else
        :rows="filteredUsers"
        :columns="tableColumns"
        @select="handleSelect"
        :loading="status == 'pending'">
        <template #hackspace-data="{ row }: { row: HackspaceUser }">
          <!-- There is no rhyme or reason to these colors. -->
          <UBadge :color="getHackspaceColor(row.hackspace)" variant="solid">
            {{ row.hackspace ?? 'none' }}
          </UBadge>
        </template>
      </UTable>

      <USlideover v-model="showUser">
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
                <span class="mr-0.5 font-semibold">Hackspace: </span>
                <UBadge
                  :color="getHackspaceColor(selectedUser!.hackspace)"
                  variant="solid">
                  {{ selectedUser!.hackspace }}
                </UBadge>
              </li>
            </ul>
          </div>

          <UDivider />

          <h3 class="text-lg font-semibold">
            Points: {{ selectedUser!.points }}
          </h3>
          <div class="flex w-full justify-around">
            <UButton color="blue" @click="addPoints(1)">+1 points</UButton>
            <UButton color="indigo" @click="addPoints(5)">+5 points</UButton>
            <UButton color="violet" @click="addPoints(10)">+10 points</UButton>
          </div>

          <div class="flex w-full justify-around">
            <UButton color="yellow" @click="addPoints(-1)">-1 points</UButton>
            <UButton color="orange" @click="addPoints(-5)">-5 points</UButton>
            <UButton color="red" @click="addPoints(-10)">-10 points</UButton>
          </div>

          <div class="flex w-full justify-around">
            <UButton color="green" @click="addPoints(+addPointsAmount)"
              >Add points</UButton
            >
            <UInput v-model="addPointsAmount" placeholder="(amount)" />
          </div>

          <UDivider />

          <h3 class="text-lg font-semibold">Set Hackspace</h3>
          <div class="flex w-full justify-around">
            <UButton
              v-for="hackspace in hackspaces"
              :color="getHackspaceColor(hackspace)"
              @click="setHackspace(hackspace)"
              >{{ hackspace }}</UButton
            >
          </div>
        </div>
      </USlideover>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { z } from 'zod';
import { createChallenge } from '~~/server/src/hackspace/schema';
import { hackspaces, type Hackspace } from '~~/server/src/types';

definePageMeta({
  middleware: ['require-auth'],
  layout: 'admin'
});

type NewChallengeData = z.infer<typeof createChallenge>;

const { getHackspaceChallenges, getHackspaceScores } = useHackspace();
const {
  updateHackspaceChallenge,
  createHackspaceChallenge,
  deleteHackspaceChallenge,
  getHackspaceUsers,
  updateHackspaceUser
} = useAdmin();

const newChallenge = ref(false);
const newChallengeData = reactive<NewChallengeData>({
  name: '',
  jcr: 0,
  qtr: 0,
  scr: 0
});

const addChallengeButtonText = ref('Add challenge');
const addChallengeButtonClicked = ref(0);
const addChallengeButtonDisabled = ref(false);

const {
  data: challenges,
  refresh: reloadChallenges,
  status
} = await useAsyncData('fetch_all_challenges', async () => {
  const response = await getHackspaceChallenges();

  if (!response.isOk()) {
    alert(`Failed to load hackspace challenges: ${response.error!.message}`);
    return;
  }

  return response.value.map(c => {
    return {
      challenge: c,
      editing: ref(false)
    };
  });
});

const { data: points, refresh: reloadPoints } = await useAsyncData(
  'fetch_hackspace_points',
  async () => {
    const response = await getHackspaceScores();

    if (!response.isOk()) {
      alert(`Failed to load hackspace points: ${response.error!.message}`);
      return;
    }

    return response.value;
  }
);

const handleUpdate = async (i: number) => {
  const c = challenges.value![i]!.challenge;
  const res = await updateHackspaceChallenge(c.name, c.qtr, c.scr, c.jcr);

  if (!res.isOk()) {
    alert(`Error updating hackspace challenge: ${res.error!.message}`);
  }

  reloadChallenges();
};

const addChallengeButtonDialogue = [
  'Add challenge',
  'Woah, slow down!',
  "There's a form below already...",
  'Do I have to step in?',
  'I guess so!'
];

const addChallengeButtonHandler = () => {
  addChallengeButtonText.value =
    addChallengeButtonDialogue[addChallengeButtonClicked.value] ?? '';
  if (
    addChallengeButtonClicked.value >=
    addChallengeButtonDialogue.length - 1
  ) {
    addChallengeButtonDisabled.value = true;
  }
  addChallengeButtonClicked.value++;
  newChallenge.value = true;
};

const resetAddChallengeButton = () => {
  addChallengeButtonClicked.value = 0;
  addChallengeButtonText.value =
    addChallengeButtonDialogue[addChallengeButtonClicked.value] ?? '';
  addChallengeButtonDisabled.value = false;
};

const createChallengeHandler = async () => {
  if (newChallengeData.name.length === 0) {
    alert("Challenge name shouldn't be empty!");
    return;
  }

  newChallenge.value = false;
  resetAddChallengeButton();

  const response = await createHackspaceChallenge(
    newChallengeData.name,
    newChallengeData.qtr,
    newChallengeData.scr,
    newChallengeData.jcr
  );

  if (!response.isOk()) {
    alert(`Message from server: ${response.error!.message}`);
    return;
  }

  reloadChallenges();
};

const cancelCreateChallengeHandler = () => {
  newChallenge.value = false;
  resetAddChallengeButton();
  reloadChallenges(); // another hacky thing but oh well
};

const confirmDeleteChallenge = ref<boolean[]>(
  challenges.value!.map(_ => false)
);
const deleteChallenge = async (i: number) => {
  if (confirmDeleteChallenge.value[i] !== true) {
    confirmDeleteChallenge.value[i] = true;
    setTimeout(() => {
      confirmDeleteChallenge.value[i] = false;
    }, 3000);
    return;
  }

  const response = await deleteHackspaceChallenge(
    challenges.value![i]!.challenge.name
  );

  if (!response.isOk()) {
    alert(`Message from server: ${response.error!.message}`);
    return;
  }

  reloadChallenges();

  confirmDeleteChallenge.value = challenges.value!.map(_ => false);
};

// hereonout is the user hackspace stuff
// UI related properties
const tableColumns = [
  {
    key: 'name',
    label: 'Name'
  },
  {
    key: 'email',
    label: 'Email'
  },
  {
    key: 'hackspace',
    label: 'Hackspace'
  },
  {
    key: 'points',
    label: 'Points'
  }
];

type HackspaceUser = {
  id: string;
  name: string;
  email: string;
  hackspace: 'qtr' | 'jcr' | 'scr' | null;
  points: number;
};

const {
  data: users,
  status: userStatus,
  error: usersError,
  refresh: refreshUsers
} = useAsyncData('user_hackspace', async () => {
  const users = await getHackspaceUsers();

  if (!users.isOk()) {
    alert(`Error fetching users: ${users.error!.message}`);
    return;
  }

  return users.value;
});

// Search related properties
const searchFilter = ref<string>('');
const filteredUsers = computed(() => {
  if (!users.value) return [];

  if (!searchFilter.value) return users.value!;

  return users.value!.filter(
    user =>
      user.name.toLowerCase().includes(searchFilter.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchFilter.value.toLowerCase()) ||
      user.id === searchFilter.value
  );
});

const selectedUser = ref<HackspaceUser | null>(null);
const showUser = ref(false);
const handleSelect = (user: HackspaceUser) => {
  selectedUser.value = user;
  showUser.value = true;
  addPointsAmount.value = 0;
};

const getHackspaceColor = (hackspace: Hackspace | null) => {
  switch (hackspace) {
    case 'qtr':
      return 'orange';
    case 'jcr':
      return 'red';
    case 'scr':
      return 'yellow';
    default:
      return 'blue';
  }
};

const addPointsAmount = ref(0);

const addPoints = async (points: number) => {
  // We do it as such to allow spamming lol
  const prevVal = selectedUser.value!.points;

  const req = await updateHackspaceUser(
    selectedUser.value!.id,
    undefined,
    selectedUser.value!.points + points
  );

  selectedUser.value!.points += points;

  if (!req.isOk()) {
    alert(`Failed to add points: ${req.error!.message}`);
    selectedUser.value!.points = prevVal;
    return;
  }

  refreshUsers();
};

const setHackspace = async (hackspace: Hackspace) => {
  const req = await updateHackspaceUser(selectedUser.value!.id, hackspace);

  if (!req.isOk()) {
    alert(`Failed to update hackspace: ${req.error!.message}`);
    return;
  }

  refreshUsers();
  selectedUser.value!.hackspace = hackspace;
};
</script>
