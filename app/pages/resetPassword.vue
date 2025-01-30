<template>
  <div
    class="mt-8 flex h-[70vh] flex-col place-items-center justify-center space-y-4">
    <h1 class="font-ichack my-4 text-center text-4xl">Reset Your Password</h1>

    <form
      class="flex w-[30%] min-w-80 flex-col space-y-4 place-self-center"
      @submit.prevent="handleSubmit">
      <RegisterGroup :icon="lockSvg">
        <ICInputPassword
          name="password"
          placeholder="Password *"
          :error="errors.password"
          v-model="password"
          required
          enableShowPassword />

        <ICInputPassword
          name="cfmpassword"
          required
          :error="errors.cfmPassword"
          v-model="cfmPassword"
          placeholder="Confirm Password *"
          enableShowPassword />
      </RegisterGroup>

      <input
        type="submit"
        value="Confirm"
        class="bg-blue-ic hover:bg-red-ic w-[50%] self-center py-5 text-2xl font-extrabold transition-colors duration-500 hover:cursor-pointer focus:bg-red-700" />
    </form>

    <ICError v-model="errors.global" />
    <ICSuccess v-model="success" />
  </div>
</template>

<script setup lang="ts">
import lockSvg from '@ui25/assets/lock.svg';
import { sleep, sleepSync } from 'bun';
import { passwordPattern } from '~~/shared/schemas';

const { resetPassword } = useAuth();
const route = useRoute();
const token = `${route.query.token}`;

const password = ref('');
const cfmPassword = ref('');
const errors = reactive({
  password: '',
  cfmPassword: '',
  global: ''
});
const success = ref('');

const handleSubmit = async () => {
  if (password.value != cfmPassword.value) {
    errors.cfmPassword = 'Passwords do not match.';
    errors.global = errors.cfmPassword;
    return;
  }

  if (!passwordPattern.test(password.value)) {
    errors.password =
      'Your password is too weak. It must be at least 8 characters long, with one uppercase character, lowercase character, and a digit.';
    errors.global = errors.password;
    return;
  }

  const res = await resetPassword(token, password.value);

  if (!res.isOk()) {
    errors.global = res.error!.message;
    return;
  }

  success.value = 'You will be redirected to the login screen shortly.';

  await new Promise(resolve => setTimeout(resolve, 1000));

  navigateTo('/login');
};

definePageMeta({
  middleware: [
    async (to, _from) => {
      const token = to.query.token;
      if (!token || typeof token !== 'string') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Token not supplied',
          fatal: true
        });
      }
    }
  ],
  layout: 'public'
});
</script>
