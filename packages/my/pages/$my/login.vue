<template>
  <form
    class="m-auto flex flex-col gap-2 p-4 max-lg:mt-6"
    @submit.prevent="handleLogin">
    <h1 class="font-ichack text-4xl">Login</h1>
    <div class="flex flex-col gap-6 border border-white p-6">
      <div class="flex flex-col gap-2">
        <p class="text-xl font-semibold">Email</p>
        <input
          type="email"
          class="bg-black p-2 outline outline-1 outline-white placeholder:text-white"
          v-model="credentials.email"
          placeholder="Email"
          required />
      </div>
      <div class="flex flex-col gap-2">
        <p class="text-xl font-semibold">Password</p>
        <input
          type="password"
          v-model="credentials.password"
          class="bg-black p-2 outline outline-1 outline-white placeholder:text-white"
          placeholder="Password"
          required />
      </div>
      <div
        class="cursor-pointer p-2 text-sm text-white underline"
        @click="handlePasswordReset">
        Forgot your password?
      </div>
      <input
        type="submit"
        value="Login"
        :class="[
          'cursor-pointer',
          { 'bg-white': !loading, 'bg-gray-400': loading },
          'p-2 text-xl font-bold text-black'
        ]"
        :disabled="loading" />
    </div>
  </form>
</template>

<script lang="ts" setup>
import type { UserCredentials } from '#shared/types';

const credentials = reactive<UserCredentials>({
  email: '',
  password: ''
});

const loading = ref(false);

const { loginUser } = useAuth();
const handleLogin = async () => {
  loading.value = true;

  const loginResult = await loginUser(credentials);

  loading.value = false;
  loginResult.fold(
    () => navigateTo('/'),
    error => {
      alert(`Server error: ${error.message}`);
    }
  );
};

const handlePasswordReset = async () => {
  alert('you should implement me at some point.');
};

useHead({
  title: 'Login'
});
</script>
