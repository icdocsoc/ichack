<template>
  <div
    class="mx-auto flex max-w-[1080px] gap-5 max-lg:flex-col lg:justify-between">
    <div
      class="sm:vertical-border vb-before vb-after flex max-w-96 place-self-center before:h-4/5 after:h-1/2 lg:flex-col">
      <div class="bg-red-ic flex flex-1 flex-col items-center gap-4 px-5 py-4">
        <div class="bg-yellow-ic m-2 size-12 self-start max-lg:hidden"></div>
        <img
          src="@ui25/assets/coloured_cube.svg"
          alt="IC Hack ‘25"
          class="px-10" />
        <h1 class="font-expanded text-4xl font-black text-white">
          IC HACK ‘25
        </h1>
        <p class="max-w-fit text-center text-lg">
          The largest student-run hackathon in Europe
        </p>
      </div>
      <div class="flex flex-col justify-between lg:hidden">
        <img src="@ui25/assets/duck-white.svg" class="m-6 -rotate-12" />
        <div class="flex">
          <p
            class="text-horizontal ml-auto min-w-max rotate-180 text-2xl font-black uppercase">
            Powered By
          </p>
          <a href="https://www.mwam.com">
            <img
              class="ml-2 h-44"
              src="@ui25/assets/sponsors/mwam-rotated.svg"
              alt="IC Hack - Marshall Wace" />
          </a>
        </div>
      </div>

      <div class="mt-4 flex gap-10 max-lg:hidden">
        <img src="@ui25/assets/candle.svg" />
        <div class="flex flex-1 flex-col items-end justify-between gap-3">
          <p class="text-end text-xl">
            The largest student-run hackathon in Europe
          </p>
          <div>
            <p class="text-end text-2xl font-black uppercase">Powered By</p>
            <a href="https://www.mwam.com">
              <img
                class="mt-2"
                src="@ui25/assets/sponsors/mwam-light.svg"
                alt="IC Hack - Marshall Wace" />
            </a>
          </div>
        </div>
      </div>
    </div>

    <form
      class="flex flex-col gap-4 rounded-lg border border-white px-4 py-6 lg:self-center"
      :state="credentials"
      @submit.prevent="handleLogin">
      <h1 class="font-ichack text-center text-4xl lg:mx-32 lg:my-4">Login</h1>
      <ICInputGroup label="Email">
        <ICInput
          type="email"
          name="email"
          required
          placeholder="Email"
          v-model="credentials.email"
          :error="errors.email" />
      </ICInputGroup>
      <ICInputGroup label="Password">
        <ICInput
          type="password"
          name="password"
          required
          placeholder="Password"
          v-model="credentials.password"
          :error="errors.password" />
      </ICInputGroup>
      <ICInputSubmit value="Login" />
    </form>

    <ICError v-model="errors.global" />
  </div>
</template>

<script lang="ts" setup>
import type { UserCredentials } from '#shared/types';
import { postLoginBody } from '#shared/schemas';

const route = useRoute();
const { redirect } = route.query;

const errors = reactive({
  email: '',
  password: '',
  global: ''
});
const credentials = reactive<UserCredentials>({
  email: '',
  password: ''
});
watch(credentials, () => {
  const validation = postLoginBody.safeParse(credentials);
  if (!validation.success) {
    const errorObj = validation.error.flatten();
    errors.email =
      credentials.email != ''
        ? (errorObj.fieldErrors.email?.join('; ') ?? '')
        : '';
    errors.password =
      credentials.password != ''
        ? (errorObj.fieldErrors.password?.join('; ') ?? '')
        : '';
  } else {
    errors.email = '';
    errors.password = '';
    errors.global = '';
  }
});

const loading = ref(false);

const { loginUser } = useAuth();
const handleLogin = async () => {
  const validation = await postLoginBody.safeParseAsync(credentials);
  if (!validation.success) {
    // email is caught by the input type
    errors.global = 'Password does not meet minimum requirements.';
    return;
  }

  loading.value = true;
  const loginResult = await loginUser(credentials);
  loading.value = false;

  loginResult.fold(
    res => {
      if (redirect) {
        return navigateTo(redirect as string);
      }

      switch (res.role) {
        case 'admin':
        case 'god':
          navigateTo('/admin');
          break;
        case 'volunteer':
          navigateTo('/volunteer');
          break;
        default:
          navigateTo('/');
      }
    },
    error => {
      errors.global = error.message;
    }
  );
};

const handlePasswordReset = async () => {
  alert('you should implement me at some point.');
};

useHead({
  title: 'Login'
});
definePageMeta({ layout: 'public' });
</script>
