<template>
  <h1 class="text-bold text-5xl">Team Management</h1>
  <div v-if="error" class="mt-4 flex flex-col gap-4 lg:inline-flex lg:text-xl">
    <div v-if="invites" class="no-scrollbar mt-4 flex gap-4 overflow-x-scroll">
      <div
        class="border border-white p-4"
        v-for="(invite, index) in invites"
        :key="invite.teamId">
        <TeamInvite
          :teamName="invite.teamName"
          :color="colors[index % 3]!"
          @accept="handleConfirmInvite(invite.teamId)"
          @decline="handleDeclineInvite(invite.teamId)" />
      </div>
    </div>

    <p>You do not have a team yet.</p>

    <button
      v-if="canSubmit"
      @click="handleCreateTeam"
      class="flex w-fit flex-row items-stretch">
      <div
        class="inline-block size-full bg-white px-4 py-5 font-semibold text-black">
        Create a new team
      </div>
      <div
        class="bg-blue-ic flex h-auto items-center justify-center px-3 py-5 text-white">
        +
      </div>
    </button>
  </div>

  <div v-else class="mb-3 mt-6 flex flex-col gap-4 lg:items-start">
    <div class="w-full border-2 border-white">
      <div class="flex items-center justify-between bg-white p-3">
        <p v-if="!editingTeam" class="p-3 text-3xl font-semibold text-black">
          {{ team!.teamName }}
        </p>
        <ICInput
          v-if="editingTeam"
          v-model="tempTeam!.teamName"
          class="p box-border border-[1px] border-black bg-white text-3xl font-semibold text-black"></ICInput>

        <p class="text-3xl font-semibold text-black">Team #{{ team!.id }}</p>

        <button v-if="!editingTeam" title="Edit team name">
          <img
            src="@ui25/assets/edit.svg"
            v-if="leader && canSubmit"
            alt="Edit profile"
            @click="handleEditTeam" />
        </button>
        <div class="h-fit space-y-2 md:space-x-5 md:space-y-0" v-else>
          <button class="max-w-fit">
            <img
              src="@ui25/assets/tick.svg"
              alt="Confirm profile edits"
              @click="handleConfirmTeamName" />
          </button>
          <button class="max-w-fit">
            <img
              src="@ui25/assets/cross.svg"
              alt="Discard profile edits"
              @click="handleCancelTeamName" />
          </button>
        </div>
      </div>

      <div class="space-y-6 px-6 py-8">
        <div>
          <h2 class="text-2xl font-semibold">Team Members</h2>
          <div class="flex flex-wrap gap-2">
            <ICTeamMember
              class="max-w-80"
              v-for="(member, i) in team!.members"
              :editing="editingTeam"
              :name="member.name"
              :color="colors[i % 3]!"
              :leader="member.leader"
              @cross="handleRemoveTeammate(member.id)" />
          </div>
        </div>

        <h2 class="text-2xl font-semibold" v-if="team!.invited.length > 0">
          Pending Invites
        </h2>
        <div class="flex flex-wrap gap-2" v-if="team!.invited.length > 0">
          <ICTeamMember
            class="w-fit"
            v-for="(member, i) in team!.invited"
            :name="member.name"
            :color="colors[i % 3]!"
            :pending="true" />
        </div>

        <div v-if="editingTeam" class="flex gap-5">
          <img src="@ui25/assets/search.svg" />
          <ICInput
            class="flex-grow"
            v-model="inviteFilter"
            placeholder="Search Person" />
        </div>

        <div class="flex flex-wrap gap-x-2 gap-y-2">
          <TeamInviteCard
            v-for="hacker in filteredHackers"
            :key="hacker.id"
            @click="handleInvite(hacker.id)"
            :name="hacker.name" />
        </div>
        <div class="flex flex-wrap gap-x-2 gap-y-2">
          <TeamInviteCard
            v-for="hacker in filteredTakenHackers"
            :key="hacker.id"
            greyed
            :name="hacker.name" />
        </div>

        <div>
          <h2 class="text-2xl font-semibold">Team Information</h2>

          <div class="space-y-6">
            <div>
              <h3>Phone Number (UK number preferred):</h3>
              <ICInput
                v-if="!editingTeam"
                :frozen="true"
                v-model="team!.phone"
                placeholder="+44..." />
              <ICInput v-else v-model="tempTeam.phone" placeholder="+44..." />
            </div>

            <div>
              <h3>Backup Phone Number:</h3>
              <ICInput
                v-if="!editingTeam"
                :frozen="true"
                placeholder="+44..."
                v-model="team!.phone2" />
              <ICInput v-else v-model="tempTeam.phone2" placeholder="+44..." />
            </div>

            <div class="max-w-fit">
              <h3>Hackspace:</h3>
              <ICInputSelect
                name="hackspace"
                v-if="!editingTeam"
                :frozen="true"
                placeholder="Hackspace"
                :options="hackspaceOptions"
                v-model="team!.hackspace" />
              <ICInputSelect
                v-else
                name="hackspaceTmp"
                placeholder="Hackspace"
                :options="hackspaceOptions"
                v-model="tempTeam.hackspace" />
            </div>

            <div>
              <h3>Table number:</h3>
              <ICInput
                v-if="!editingTeam"
                :frozen="true"
                v-model="team!.tableNumber" />
              <ICInput v-else v-model="tempTeam.tableNumber" />
            </div>

            <div>
              <h3>
                <a
                  href="https://ic-hack-25.devpost.com/"
                  target="_blank"
                  class="underline"
                  >Submission Link:</a
                >
              </h3>
              <ICInput
                v-if="!editingTeam"
                :frozen="true"
                placeholder="devpost.com/..."
                v-model="team!.submissionLink" />
              <ICInput
                v-else
                v-model="tempTeam.submissionLink"
                placeholder="devpost.com/..."
                pattern="urlRegex" />
            </div>

            <div>
              <h3>Category:</h3>
              <ICInputSelect
                class="w-fit"
                v-if="!editingTeam"
                name="docsocCategory"
                :frozen="true"
                v-model="team!.docsocCategory"
                placeholder="Please select a category"
                :options="mapCategories(docsoc_categories)" />
              <ICInputSelect
                class="w-fit"
                v-else
                name="docsocCategoryTmp"
                v-model="tempTeam.docsocCategory"
                placeholder="Please select a category"
                :options="mapCategories(docsoc_categories)" />
            </div>

            <div v-if="showSponsorCategory">
              <h3>Sponsor Category:</h3>
              <ICInputSelect
                class="w-fit"
                v-if="!editingTeam"
                name="sponsorCategory"
                :frozen="true"
                v-model="team!.sponsorCategory"
                placeholder="Please select a category"
                :options="mapCategories(sponsor_categories)" />
              <ICInputSelect
                class="w-fit"
                v-else
                name="sponsorCategoryTmp"
                v-model="tempTeam.sponsorCategory"
                placeholder="Please select a category"
                :options="mapCategories(sponsor_categories)" />
            </div>

            <div>
              <ICInputCheckbox
                :fixed="!editingTeam"
                title="Have you used Intersystems IRIS Vector Search in your project?"
                description="Tick yes to enter for Intersystems' challenge."
                name="terms"
                v-model="tempTeam.intersystems" />
            </div>

            <div
              class="p-5"
              :class="
                missingRequirements.length > 0 ? 'bg-red-ic' : 'bg-green-400'
              ">
              <h3 v-if="!editingTeam" :class="['text-xl font-black']">
                You have {{ missingRequirements.length > 0 ? 'NOT' : '' }} met
                all the requirements to submit.
              </h3>
              <ul v-if="missingRequirements.length > 0 && !editingTeam">
                <strong>Your team will not be considered for judging.</strong>
                You are missing:
                <li
                  v-for="req in missingRequirements"
                  :key="req"
                  class="ml-8 list-disc">
                  {{ req }}
                </li>
              </ul>
              <p v-else>
                Your team will automatically be submitted for judging at the
                deadline.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button
      v-if="canSubmit"
      class="bg-red-ic mb-4 self-start px-4 py-2 font-semibold"
      @click="handleDestroyTeam">
      {{ leader ? 'Disband' : 'Leave' }} Team
    </button>
  </div>

  <ICError v-model="errorMessage" />
</template>

<script setup lang="ts">
import type { Category, ReturnedTeam } from '#shared/types';
import { phoneRegex } from '#shared/schemas';
import TeamInvite from '~~/packages/ui25/components/IC/TeamInvite.vue';

const colors = ['bg-red-ic', 'bg-blue-ic', 'bg-yellow-ic'];

definePageMeta({ middleware: ['require-auth', 'require-link'] });

const { data: canSubmit } = await useAsyncData('can_submit', async () => {
  const { getMetaDataInfo } = useAdmin();
  const res = await getMetaDataInfo();
  return res.getOrThrow().allowSubmissions;
});

const showSponsorCategory = ref(true);

const mapCategories = (values: readonly Category[]) =>
  values.map(v => {
    return {
      displayName: `${v.owner} - ${v.title}`,
      value: v.slug
    };
  });

const hackspaceOptions = [
  { displayName: "Queen's Tower Room", value: 'qtr' },
  { displayName: 'Senior Common Room', value: 'scr' },
  { displayName: 'Junior Common Room', value: 'jcr' }
];

const {
  getOwnTeam,
  getTeamInvites,
  getCategories,
  createTeam,
  hackerInviteSearch,
  updateOwnTeam,
  removeTeammate,
  inviteTeammate,
  leaveTeam,
  acceptInvite,
  declineInvite,
  disbandTeam
} = useTeams();

const urlRegex = /https:\/\/ic-hack-25.devpost.com\/.+/;
const store = useProfileStore();
const profile = store.profile!;

const errorMessage = ref('');
const missingRequirements = computed(() => {
  const reqs = [];

  if (!tempTeam.phone) reqs.push('phone number');
  if (!tempTeam.hackspace) reqs.push('hackspace');
  if (!tempTeam.tableNumber) reqs.push('table number');
  if (!tempTeam.submissionLink) reqs.push('submission link');
  if (!tempTeam.docsocCategory) reqs.push('DoCSoc category');
  if (
    !tempTeam.sponsorCategory &&
    tempTeam?.docsocCategory !== 'docsoc-non-technical-pitch'
  )
    reqs.push('sponsor category');

  return reqs;
});

const editingTeam = ref(false);
const maxTeammates = computed(
  () =>
    (team.value?.members.length ?? 0) + (team.value?.members.length ?? 0) >= 6
);

const phone1Outline = computed(() =>
  !tempTeam.phone
    ? 'outline-white'
    : phoneRegex.test(tempTeam.phone)
      ? 'outline-white'
      : 'outline-red-700'
);
const phone2Outline = computed(() =>
  !tempTeam.phone2
    ? 'outline-white'
    : phoneRegex.test(tempTeam.phone2)
      ? 'outline-white'
      : 'outline-red-700'
);
const submissionOutline = computed(() =>
  !tempTeam.submissionLink
    ? 'outline-white'
    : urlRegex.test(tempTeam.submissionLink ?? '')
      ? 'outline-white'
      : 'outline-red-700'
);

// TODO: Should this be fetched from some api route?
const editable = ref(true);

const { data: all_categories } = await useAsyncData(
  'fetch_categories',
  async () => {
    const res = await getCategories();

    // 404, no categories public yet
    if (!res.isOk()) {
      return [];
    }

    return res.value;
  }
);

const docsoc_categories =
  all_categories.value?.filter(c => c?.owner == 'DoCSoc') ?? [];
const sponsor_categories =
  all_categories.value?.filter(c => c?.owner != 'DoCSoc') ?? [];

const {
  data: team,
  refresh: reloadTeam,
  error
} = await useAsyncData<ReturnedTeam>('fetch_team', async () => {
  const res = await getOwnTeam();

  if (!res.isOk()) {
    throw Error('No team found');
  }

  return res.value;
});

const { data: invites, refresh: reloadInvites } = await useAsyncData(
  'fetch_invites',
  async () => {
    const res = await getTeamInvites();

    if (!res.isOk()) {
      throw new Error(res.error!.message);
    }

    return res.value;
  }
);

const leader = computed<boolean>(() => {
  if (!team.value) return false;
  for (const member of team.value.members) {
    if (member.id == profile.id) return member.leader;
  }
  return false;
});

// We have thse bc we want undefined, not null
const tempTeam = reactive({
  teamName: team.value?.teamName ?? '',
  docsocCategory: team.value?.docsocCategory ?? undefined,
  sponsorCategory: team.value?.sponsorCategory ?? undefined,
  submissionLink: team.value?.submissionLink ?? undefined,
  phone: team.value?.phone ?? undefined,
  phone2: team.value?.phone2 ?? undefined,
  intersystems: team.value?.intersystems ?? undefined,
  tableNumber: team.value?.tableNumber ?? undefined,
  hackspace: team.value?.hackspace ?? undefined
});

watchEffect(() => {
  if (tempTeam.docsocCategory === 'docsoc-non-technical-pitch') {
    tempTeam.sponsorCategory = undefined;
    showSponsorCategory.value = false;
    errorMessage.value =
      'You have selected the DoCSoc Non-Technical Pitch category. You will not be able to select a sponsor category.';
  } else {
    showSponsorCategory.value = true;
  }
});

async function handleCreateTeam() {
  let teamName = `${profile.name.split(' ')[0]}'s Team`;

  const res = await createTeam(teamName);

  if (!res.isOk()) {
    // This function should only be callable if they aren't in a team.
    errorMessage.value =
      'This should never happen. Please contact us on Discord.';
    return;
  }

  tempTeam.teamName = teamName;

  await reloadTeam();
}

type potentialTeammates = {
  id: string;
  name: string;
  inTeam: boolean;
}[];
const inviteFilter = ref<string>('');
const filteredHackers = ref<potentialTeammates>([]);
const filteredTakenHackers = ref<potentialTeammates>([]);
let searchingTimeout: NodeJS.Timeout;
let searching = ref(false);

watch([inviteFilter, team], ([newVal, _]) => {
  if (newVal == '') {
    filteredHackers.value = [];
    filteredTakenHackers.value = [];

    searching.value = false;
    clearTimeout(searchingTimeout);
    return;
  }

  searching.value = true;
  clearTimeout(searchingTimeout);
  searchingTimeout = setTimeout(searchForHacker, 1000, newVal);
});

async function searchForHacker(search: string) {
  const req = await hackerInviteSearch(search);

  let hackers: potentialTeammates = []; // FIXME fix the type name LOL
  if (!req.isOk()) {
    return;
  }

  hackers = req.value.filter(h => !team.value!.invited.find(i => i.id == h.id));

  // Yes I could do this in one pass but it's not that deep
  // yes jamie ain't code-reviewing this.
  filteredHackers.value = hackers.filter(h => !h.inTeam).slice(0, 10);
  filteredTakenHackers.value = hackers.filter(h => h.inTeam).slice(0, 10);
  searching.value = false;
}

async function handleConfirmTeamName() {
  if (team.value!.phone2 == null && tempTeam.phone2 == '')
    tempTeam.phone2 = undefined;

  if (tempTeam.submissionLink == '') tempTeam.submissionLink = undefined;

  if (!phoneRegex.test(tempTeam.phone ?? '')) {
    errorMessage.value =
      "Please ensure you've provided a phone number, with the country code.";
    return;
  }
  if (tempTeam.phone2 && !phoneRegex.test(tempTeam.phone2)) {
    errorMessage.value =
      "Please ensure the backup phone number you've provided is correct, with the country code.";
    return;
  }
  if (
    tempTeam.submissionLink &&
    !tempTeam.submissionLink.includes('devpost.com')
  ) {
    errorMessage.value =
      'Please ensure your submission link is a proper Devpost URL. It should contain "devpost.com".';
    return;
  }

  editingTeam.value = false;
  inviteFilter.value = '';

  // Only make the request if something has changed.
  const noChanges = Object.keys(tempTeam).every(elem => {
    return (
      tempTeam[elem as keyof typeof tempTeam] == undefined ||
      tempTeam[elem as keyof typeof tempTeam] ==
        team.value![elem as keyof typeof team.value]
    );
  });

  if (noChanges) return;

  const req = await updateOwnTeam(tempTeam);

  if (!req.isOk()) {
    errorMessage.value = req.error!.message;
    return;
  }

  await reloadTeam();
}

function handleCancelTeamName() {
  // reset all temp values to default values
  editingTeam.value = false;
  inviteFilter.value = '';
  Object.assign(tempTeam, {
    teamName: team.value?.teamName ?? '',
    docsocCategory: team.value?.docsocCategory ?? undefined,
    sponsorCategory: team.value?.sponsorCategory ?? undefined,
    submissionLink: team.value?.submissionLink ?? undefined,
    phone: team.value?.phone ?? undefined,
    phone2: team.value?.phone2 ?? undefined,
    intersystems: team.value?.intersystems ?? undefined,
    tableNumber: team.value?.tableNumber ?? undefined
  });
}

async function handleEditTeam() {
  if (!leader.value) return;
  editingTeam.value = true;
}

async function handleRemoveTeammate(userId: string) {
  if (!confirm('Are you sure? This action cannot be reversed.')) return;

  const res = await removeTeammate(userId);

  if (!res.isOk()) {
    errorMessage.value = res.error!.message;
    return;
  }

  await reloadTeam();
}

async function handleCancelInvite(teammate: string) {
  alert("apparently we don't have a way to do this");
}

async function handleInvite(userId: string) {
  const req = await inviteTeammate(userId);

  if (!req.isOk()) {
    errorMessage.value =
      "It looks like this person joined a team right before you hit plus, I'm sorry :')";
  }

  await reloadTeam();
}

async function handleDestroyTeam() {
  if (!confirm('Are you sure? This action cannot be reversed.')) return;
  const req = leader.value ? await disbandTeam() : await leaveTeam();

  if (!req.isOk()) {
    errorMessage.value = req.error!.message;
  }

  await reloadInvites();
  await reloadTeam();
}

async function handleConfirmInvite(teamId: number) {
  const req = await acceptInvite(teamId);

  if (!req.isOk()) {
    errorMessage.value = req.error!.message;
  }

  await reloadInvites();
  await reloadTeam();
}

async function handleDeclineInvite(teamId: number) {
  if (!confirm('Are you sure? This action cannot be reversed.')) return;

  const res = await declineInvite(teamId);
  if (!res.isOk()) {
    errorMessage.value = res.error!.message;
  }

  await reloadInvites();
}
</script>
