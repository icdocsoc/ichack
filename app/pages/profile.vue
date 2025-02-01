<template>
  <div class="flex flex-col gap-y-3">
    <div class="w-full border-2 border-white">
      <div class="flex justify-between bg-white p-3">
        <p class="text-3xl font-semibold text-black">{{ profile.name }}</p>
        <button v-if="!isEditing">
          <img
            src="@ui25/assets/edit.svg"
            alt="Edit profile"
            @click="isEditing = true" />
        </button>
        <div class="space-y-2 md:space-x-5 md:space-y-0" v-else>
          <button class="max-w-fit">
            <img
              src="@ui25/assets/tick.svg"
              alt="Confirm profile edits"
              @click="confirmEdit" />
          </button>
          <button class="max-w-fit">
            <img
              src="@ui25/assets/cross.svg"
              alt="Discard profile edits"
              @click="discardEdit" />
          </button>
        </div>
      </div>

      <div class="space-y-6 px-6 py-8">
        <ProfileGroup title="Email" :image="mailSvg">
          <p class="text-lg">{{ profile.email }}</p>
        </ProfileGroup>

        <ProfileGroup title="Discord" :image="discordSvg">
          <!-- <p class="text-lg">
            (coming soon - v-if not in server join else show)
          </p> -->
          <Discord
            :linkedDiscord="profile.discord_id != null"
            @unlinked="profile.discord_id = null" />
        </ProfileGroup>

        <ProfileGroup title="Pronouns" :image="mugshotWhite">
          <p v-if="!isEditing" class="text-lg">{{ profile.pronouns }}</p>
          <ICInputSelect
            v-else
            type="text"
            name="pronouns"
            required
            placeholder="Pronouns *"
            v-model="tempPronouns"
            :other="true"
            :options="pronounOptions" />
        </ProfileGroup>

        <ProfileGroup title="Dietary Restrictions" :image="no">
          <p class="text-lg">{{ profile.dietary_restrictions.join(', ') }}</p>
        </ProfileGroup>

        <ICInputCheckbox
          title="Photos Opt Out"
          name="photosOptOut"
          description="Remember to collect your opt-out sticker."
          :fixed="!isEditing"
          v-model="tempPhotosOptOut" />

        <div>
          <p class="mb-2 text-2xl font-semibold">Hackspace</p>
          <div
            v-if="
              tempHackspace && (!isEditing || (isEditing && !hackspaceEditable))
            "
            class="flex justify-between">
            <Hackspace :hackspace="tempHackspace" />
          </div>

          <div
            v-if="!profile.hackspace || (isEditing && hackspaceEditable)"
            class="flex cursor-pointer flex-col justify-around gap-y-4 md:flex-row md:gap-x-4 md:gap-y-0">
            <Hackspace
              v-for="hackspace in hackspaces"
              :key="hackspace"
              :hackspace="hackspace"
              :class="
                tempHackspace == hackspace ? 'border-2 border-white p-2' : ''
              "
              @click="handleUpdateHackspace(hackspace)" />
          </div>
        </div>
      </div>
    </div>

    <NuxtLink
      class="max-w-fit bg-white px-2 py-2 text-lg font-bold text-black"
      to="/ticket">
      Show ID
    </NuxtLink>

    <ICError :error="error" />
  </div>
</template>

<script setup lang="ts">
import mailSvg from '@ui25/assets/mail-white.svg';
import mugshotWhite from '@ui25/assets/mugshot-white.svg';
import discordSvg from '@ui25/assets/discord.svg';
import no from '@ui25/assets/no.svg';
import { hackspaces, type Hackspace as HackspaceT } from '~~/server/src/types';
import Hackspace from '~~/packages/ui25/components/IC/Hackspace.vue';

const { joinHackspace, updateHackspace } = useHackspace();
const { getMetaDataInfo } = useAdmin();
const { updateProfile } = useProfile();

const client = useHttpClient();
const store = useProfileStore();
const profile = store.profile!;
const error = ref('');

const isEditing = ref(false);
const pronounOptions = ['he/him', 'she/her', 'they/them'].map(p => {
  return { displayName: p, value: p };
});

const tempPronouns = ref(profile.pronouns);
const tempHackspace = ref(profile.hackspace);
const tempPhotosOptOut = ref(profile.photos_opt_out);

const confirmEdit = async () => {
  isEditing.value = false;
  // do the post requests :3

  const res = await updateProfile({
    pronouns: tempPronouns.value,
    photos_opt_out: tempPhotosOptOut.value
  });

  if (!res.isOk()) {
    error.value = res.error!.message;
    tempHackspace.value = profile.hackspace;
    return;
  }

  profile.pronouns = tempPronouns.value;
  profile.photos_opt_out = tempPhotosOptOut.value;

  if (tempHackspace.value != profile.hackspace) {
    await handleUpdateHackspace(tempHackspace.value!);
  }
};

const discardEdit = async () => {
  // TODO: Make a cute little prompt component if time permits.
  // Time does not permit.
  if (!confirm('Are you sure you want to discard your edits?')) return;
  isEditing.value = false;

  tempPronouns.value = profile.pronouns;
  tempHackspace.value = profile.hackspace;
  tempPhotosOptOut.value = profile.photos_opt_out;
};

const handleUpdateHackspace = async (hackspace: HackspaceT) => {
  // No hackspace, join
  if (!profile.hackspace) {
    const res = await joinHackspace(hackspace);

    if (!res.isOk()) {
      error.value = res.error!.message;
      return;
    }

    profile.hackspace = hackspace;
    tempHackspace.value = hackspace;
    return;
  }

  tempHackspace.value = hackspace;
  if (isEditing.value) return;

  const res = await updateHackspace(hackspace);

  if (!res.isOk()) {
    error.value = res.error!.message;
    return;
  }

  profile.hackspace = hackspace;
};

// If admin fails we have bigger problem :')
const adminInfo = (await getMetaDataInfo()).value!;
const hackspaceEditable = ref(adminInfo.mealNumber < 1);

definePageMeta({
  heading: 'Profile',
  middleware: ['require-auth', 'require-link']
});

useHead({
  title: 'Profile'
});
</script>
