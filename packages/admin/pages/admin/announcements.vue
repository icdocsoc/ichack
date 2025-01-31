<script setup lang="ts">
import useAnnouncements from '~~/packages/common/composables/useAnnouncements';
import type {
  AnnouncementDetails,
  CreateAnnouncementDetails
} from '~~/shared/types';
import { z } from 'zod';
import { Result } from 'typescript-result';
import { createAnnouncementSchema } from '~~/server/src/announcement/schema';

/* UI Related Properties */
/* The idea behind the change here is that we can reuse the same form for creating 
and editing by just changing the fields of announcementDetails */
const isModalOpen = ref(false);
const isEditing = ref(false);
const editingId = ref<number | undefined>(undefined);

// Get user info
const { profile } = useProfileStore();

// Get composables
const {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
  editAnnouncement,
  resyncAnnouncement
} = useAnnouncements();

const announcementDetails = reactive<CreateAnnouncementDetails>({
  title: '',
  description: '',
  pinUntil: null,
  location: ''
});

const schema = createAnnouncementSchema.superRefine((data, ctx) => {
  if (isPinned.value && !data.pinUntil) {
    ctx.addIssue({
      path: ['pinUntil'],
      message: 'Date and Time required for a pinned announcement',
      code: 'custom'
    });
  }
});

const { data, refresh, status, error } = await useAsyncData(
  'announcements',
  async () => {
    const res = await getAnnouncements();
    if (res.isError()) {
      console.log(res.error);
    } else {
      return res.getOrNull();
    }
  }
);

// Computed property to handle Date/str conversion
const pinUntilString = computed({
  get() {
    return announcementDetails.pinUntil
      ? announcementDetails.pinUntil.toISOString().slice(0, 16)
      : '';
  },
  set(value: string) {
    announcementDetails.pinUntil = value ? new Date(value) : null;
  }
});

// For pinned checkbox
const isPinned = ref(false);
watch(isPinned, value => {
  // if the checkbox is unchecked, set the pinUntil date to null
  if (!value) {
    announcementDetails.pinUntil = null;
  }
});

// Other misc things
definePageMeta({
  middleware: ['require-auth'],
  layout: 'admin'
});

async function handleSubmit() {
  if (
    announcementDetails.pinUntil &&
    isNaN(announcementDetails.pinUntil.getTime())
  ) {
    console.error('Invalid date');
    return;
  }
  // we choose which function to call based on whether we are editing or creating
  let response!: Result<void, Error>;
  if (isEditing.value && editingId.value !== undefined) {
    response = await editAnnouncement(editingId.value, announcementDetails);
  } else {
    response = await createAnnouncement({ ...announcementDetails });
  }
  if (response.isError()) {
    console.error(response.error);
    alert(response.error);
  }
  refresh();

  // Reset form information
  announcementDetails.title = '';
  announcementDetails.description = '';
  announcementDetails.pinUntil = null;
  isPinned.value = false;
  isModalOpen.value = false;
  isEditing.value = false;
  editingId.value = undefined;
}

// Functions to pass manage announcements
const handleDelete = async (id: number) => {
  const response = await deleteAnnouncement(id);
  if (response.isError()) {
    console.error(response.error);
    alert(response.error);
  }
  refresh();
};

const handleEdit = async (announcement: AnnouncementDetails) => {
  isEditing.value = true;
  // copy over the details to announcementDetails
  announcementDetails.title = announcement.title;
  announcementDetails.description = announcement.description;
  announcementDetails.pinUntil = announcement.pinUntil
    ? new Date(announcement.pinUntil)
    : null;
  isPinned.value = !!announcement.pinUntil;
  editingId.value = announcement.id;

  // open the pop up modal
  isModalOpen.value = true;
};

const handleResync = async (id: number) => {
  console.log('resyncing...');
  const response = await resyncAnnouncement(id);
  if (response.isError()) {
    console.error(response.error);
    alert(response.error);
  }
  refresh();
};

// Function which organises the announcements into pinned and regular so they can be displayed easily
const announcementsByStatus = computed<{
  pinned: AnnouncementDetails[];
  regular: AnnouncementDetails[];
}>(() => {
  if (status.valueOf() === 'loading' || !data.value) {
    return { pinned: [], regular: [] };
  }
  const today = new Date();
  return data.value.reduce(
    (
      acc: { pinned: AnnouncementDetails[]; regular: AnnouncementDetails[] },
      announcement: AnnouncementDetails
    ) => {
      if (announcement.pinUntil && new Date(announcement.pinUntil) >= today) {
        acc.pinned.push(announcement);
      } else {
        acc.regular.push(announcement);
      }
      return acc;
    },
    { pinned: [], regular: [] }
  );
});
</script>

<template>
  <UContainer class="relative max-h-full overflow-y-scroll">
    <h2 class="text-center text-5xl font-semibold">Manage Announcements</h2>
    <br />
    <UButton
      label="Create Announcement"
      @click="isModalOpen = true"
      v-if="profile!.role == 'god' || profile!.role == 'admin'" />

    <UAlert v-if="error" :title="error.message" />

    <!-- Displaying all the announcements -->
    <UContainer v-else>
      <div v-if="status.valueOf() === 'loading'">
        <p>Loading announcements...</p>
      </div>

      <AnnouncementsCategory
        :announcements="announcementsByStatus.pinned"
        title="Pinned Announcements"
        @handleDelete="handleDelete"
        @handleEdit="handleEdit"
        @resync="handleResync" />

      <AnnouncementsCategory
        :announcements="announcementsByStatus.regular"
        title="Regular Announcements"
        @handleDelete="handleDelete"
        @handleEdit="handleEdit"
        @handleResync="handleResync" />

      <!-- When there are no announcements at all -->
      <div
        v-if="
          !announcementsByStatus.pinned.length &&
          !announcementsByStatus.regular.length
        ">
        <p class="p-8 text-center text-xl font-semibold">
          No Announcements Available
        </p>
        <p class="p-8 text-center text-lg font-thin">
          You can add an announcement using the button above!
        </p>
      </div>
    </UContainer>

    <!-- Add/Edit Announcement Form -->
    <UModal v-model="isModalOpen">
      <UContainer class="mb-4 grid grid-flow-row justify-center p-10">
        <UForm
          data-testid="form"
          :schema="schema"
          :state="announcementDetails"
          class="p-4"
          @submit="handleSubmit">
          <UFormGroup label="Title" name="title">
            <UInput
              v-model="announcementDetails.title"
              placeholder="Title..." />
          </UFormGroup>
          <UFormGroup label="Description" name="description">
            <UTextarea
              autoresize
              resize
              v-model="announcementDetails.description"
              placeholder="Description..." />
          </UFormGroup>
          <UFormGroup label="Location" name="location">
            <UInput
              v-model="announcementDetails.location"
              placeholder="Location..." />
          </UFormGroup>
          <UFormGroup
            label="Pin Until"
            name="pinUntil"
            class="justify-center p-1">
            <UCheckbox label="Pinned" v-model="isPinned" />
            <UInput
              type="datetime-local"
              :disabled="!isPinned"
              v-model="pinUntilString" />
          </UFormGroup>
          <UButton type="submit" class="justify-center p-4">Submit</UButton>
        </UForm>
      </UContainer>
    </UModal>
  </UContainer>
</template>
