<template>
  <NuxtLayout name="toolbar">
    <div class="px-4">
      <div class="flex justify-center py-3">
        <h1 class="text-3xl font-bold">IC Hack Events</h1>
      </div>

      <div class="px-24">
        <UAccordion
          size="xl"
          open-icon="i-heroicons-plus"
          close-icon="i-heroicons-minus"
          :items="[
            {
              label: 'Add a new Event',
              defaultOpen: false, // TODO make this false
              slot: 'new-event'
            }
          ]">
          <template #new-event>
            <UForm
              :schema="createEventSchema"
              :state="newEventState"
              class="flex justify-around px-8"
              @submit="handleAddEvent">
              <UFormGroup label="Title" name="title">
                <UInput v-model="newEventState.title" />
              </UFormGroup>

              <UFormGroup label="Description" name="description">
                <UTextarea v-model="newEventState.description" resize />
              </UFormGroup>

              <UFormGroup label="Starts At" name="startsAt">
                <UInput type="datetime-local" v-model="startsAtDateString" />
              </UFormGroup>

              <UFormGroup label="Ends At" name="endsAt">
                <UInput type="datetime-local" v-model="endsAtDateString" />
              </UFormGroup>

              <UFormGroup label="Public" name="public">
                <UCheckbox v-model="newEventState.public" />
              </UFormGroup>

              <UButton type="submit" class="self-center">Submit</UButton>
            </UForm>
          </template>
        </UAccordion>
        <UTable
          :rows="events"
          :columns="columns"
          :loading="status == 'pending'">
          <template #startsAt-data="{ row }">
            {{ dateString(row.startsAt) }}
          </template>
          <template #endsAt-data="{ row }">
            {{ dateString(row.endsAt) }}
          </template>
          <template #public-data="{ row }">
            <UCheckbox v-model="row.public" disabled />
          </template>
        </UTable>
      </div>
    </div>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import type { Event } from '#shared/types';
import { createEventSchema } from '#shared/schemas';
import { z } from 'zod';
import { formatDate } from 'date-fns';

type NewEventState = z.infer<typeof createEventSchema>;

/* UI Stuff */
const columns: { key: keyof Event; label: string }[] = [
  {
    key: 'id',
    label: 'ID'
  },
  {
    key: 'title',
    label: 'Title'
  },
  {
    key: 'description',
    label: 'Description'
  },
  {
    key: 'startsAt',
    label: 'Starts At'
  },
  {
    key: 'endsAt',
    label: 'Ends At'
  },
  {
    key: 'public',
    label: 'Public'
  }
];
const newEventState = reactive<NewEventState>({
  title: '',
  description: '',
  startsAt: new Date(),
  endsAt: null,
  public: false
});

const startsAtDateString = ref(newEventState.startsAt.toISOString());
const endsAtDateString = ref(newEventState.endsAt?.toISOString() ?? '');
watch([startsAtDateString, endsAtDateString], () => {
  newEventState.startsAt = new Date(startsAtDateString.value);
  newEventState.endsAt = endsAtDateString.value
    ? new Date(endsAtDateString.value)
    : null;
});
const dateString = (date: Date) => {
  return formatDate(date, 'E, do LLL, p');
};

/* Get the initial data */
const {
  data: events,
  refresh: reloadEvents,
  status
} = await useAsyncData<Event[]>('fetch_all_events', async () => {
  const headers = useRequestHeaders();
  const response = await client.event.$get(undefined, { headers });
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }

  const events = await response.json();
  /* Issue described at https://github.com/honojs/hono/issues/3771 */
  return events.map(
    e =>
      ({
        ...e,
        startsAt: new Date(e.startsAt),
        endsAt: e.endsAt ? new Date(e.endsAt) : null
      }) as Event
  );
});

async function handleAddEvent() {
  // This is validated by UForm
  // This request will be in the browser,
  // So no need to explicitly set the headers
  const response = await client.event.$post({
    json: newEventState
  });

  if (!response.ok) {
    const errMessage = await response.text();
    alert(`Message from server: ${errMessage}`);
    return;
  }

  reloadEvents();
  clearState();
}

function clearState() {
  newEventState.title = '';
  newEventState.description = '';
  newEventState.startsAt = new Date();
  newEventState.endsAt = null;
  newEventState.public = false;
}

/* Metadata */
definePageMeta({
  middleware: ['require-auth']
});
</script>
