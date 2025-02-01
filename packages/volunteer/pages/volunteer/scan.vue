<template>
  <div class="flex w-full max-w-sm flex-col items-center text-center">
    <span class="flex w-full flex-row items-center justify-between align-middle"
      ><h1 class="font-ichack">scanning for {{ scanType }}</h1>
      <UButton
        to="/volunteer"
        color="gray"
        icon="heroicons-outline-arrow-uturn-left" />
    </span>
    <SearchEvents v-if="scanType === Scanfor.EVENT" v-model="eventChosen" />
    <div class="my-5 flex items-center justify-center pr-1">
      <qrcode-stream
        @detect="onDetect"
        :paused="pauseScanning"
        @camera-on="onReady"
        @error="onError">
      </qrcode-stream>
    </div>
    <h3 :class="statusClass">
      {{ status }}
    </h3>
  </div>
  <div v-if="data">
    <MealCard
      v-if="scanType === Scanfor.MEAL"
      :profile="data!"
      :success="st === 'success'"
      :errMsg="null" />
    <EventCard
      v-else-if="scanType === Scanfor.EVENT"
      :profile="data!"
      :success="st === 'success'"
      :errMsg="null" />
    <ProfileCard
      v-else-if="scanType === Scanfor.PROFILE || scanType === Scanfor.REGISTER"
      :profile="data!" />
  </div>
  <UButton
    v-if="showNextBtn"
    @click="next"
    class="font-ichack text-1xl mb-5 w-full text-center"
    block>
    SCAN NEW USER
  </UButton>
</template>

<script setup lang="ts">
import { QrcodeStream, type DetectedBarcode } from 'vue-qrcode-reader';
import { Scanfor, type Event } from '~~/shared/types';
import SearchEvents from '../../components/SearchEvents.vue';
definePageMeta({
  middleware: [
    'require-auth',
    function checkHacker() {
      const store = useProfileStore();
      if (store.profile!.role === 'hacker') {
        return navigateTo('/');
      }
    }
  ]
});
useHead({
  title: 'Volunteeer Scanner'
});

const { getQr } = useQR();
const { checkIn } = useEvents();

const route = useRoute();
const scanType = route.query.scanFor as Scanfor; //determine what route to call
const client = useHttpClient();
const uuid = ref<string>('');
const status = ref<string>('Starting Scanner...');
const statusClass = ref<string>('text-white');
const pauseScanning = ref<boolean>(false);
const showNextBtn = ref<boolean>(false);
const eventChosen = ref<Event>();

const { validateUserHackspace } = useHackspace();

const {
  data,
  status: st,
  error,
  clear,
  refresh
} = useAsyncData('qrToMethod', async () => {
  if (scanType === Scanfor.REGISTER) {
    // REGISTER USER VERIFICATION
    const res = await client.profile[':id'].$get({ param: { id: uuid.value } });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  } else {
    const res = await getQr(uuid.value);
    if (res.isOk()) {
      const prof = res.value;
      switch (scanType) {
        case Scanfor.MEAL:
          const validHackspaceRes = await validateUserHackspace(prof.id);
          if (!validHackspaceRes.isOk()) throw validHackspaceRes.error;
          const meal = await client.profile.meal.$put({
            json: { userId: prof.id }
          });
          if (!meal.ok) throw new Error(await meal.text());

          return prof;
        case Scanfor.EVENT:
          if (!eventChosen.value || eventChosen.value == undefined)
            throw new Error('Event Not Found!');

          const ev = await checkIn(eventChosen.value!.id, prof.id);
          if (!ev.isOk()) throw ev.error;

        case Scanfor.PROFILE:
          return prof;
        default:
          throw new Error('Invalid Scan Type!');
      }
    } else throw new Error('Profile Not Found!');
  }
});

watchEffect(() => {
  switch (st.value) {
    case 'success':
      status.value = 'Success!';
      statusClass.value = 'text-green-500';
      showNextBtn.value = true;
      break;
    case 'error':
      status.value = error.value?.message ?? 'Unkown Error';
      statusClass.value = 'text-red-500 text-3xl font-bold';
      showNextBtn.value = true;
      break;
    case 'idle':
      status.value = 'Waiting for QR Code...';
      statusClass.value = 'text-white';
      break;
    case 'pending':
      status.value = 'Qr Code Detected! please wait...';
      statusClass.value = 'text-blue-500';
      break;
  }
});

function onDetect(detectedCodes: DetectedBarcode[]) {
  pauseScanning.value = true;
  uuid.value = detectedCodes[0]?.rawValue ?? 'NOT FOUND';
  refresh();
}

function onReady() {
  status.value = 'Waiting for QR Code...';
  statusClass.value = 'text-white';
  clear();
}

function onError(error: Error) {
  statusClass.value = 'text-red-500 text-xl';
  if (error.name === 'NotAllowedError') {
    status.value = 'Camera access denied by user.';
  } else if (error.name === 'NotFoundError') {
    status.value = 'No suitable camera device found.';
  } else if (error.name === 'NotSupportedError') {
    status.value = 'Page must be served over HTTPS or localhost.';
  } else if (error.name === 'NotReadableError') {
    status.value = 'Camera is already in use.';
  } else if (error.name === 'OverconstrainedError') {
    status.value = 'Requested camera not available.';
  } else if (error.name === 'StreamApiNotSupportedError') {
    status.value = 'Browser lacks required features.';
  } else {
    status.value = 'An unknown error occurred.';
  }
}

function next() {
  clear();
  pauseScanning.value = false;
  showNextBtn.value = false;
}
</script>
