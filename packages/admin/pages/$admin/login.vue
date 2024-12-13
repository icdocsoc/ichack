<script lang="ts" setup>
import { postLoginBody } from '#shared/schemas';
import type { UserCredentials } from '#shared/types';

const userCredentials = reactive<UserCredentials>({
  email: '',
  password: ''
});

const handleLogin = async () => {
  // UForm already validates the form
  const { loginUser } = useAuth();
  const loginResult = await loginUser(userCredentials);

  loginResult.fold(
    () => navigateTo('/'),
    error => {
      alert(`Server error: ${error.message}`);
    }
  );
};
</script>

<template>
  <h2 class="text-center text-5xl font-semibold">Admin's Login Screen</h2>
  <UContainer class="flex flex-col items-center justify-center">
    <UForm
      :schema="postLoginBody"
      :state="userCredentials"
      @submit="handleLogin">
      <UFormGroup label="Email" name="email" required>
        <UInput
          v-model="userCredentials.email"
          placeholder="Enter Email"
          type="email"
          icon="i-heroicons-envelope" />
      </UFormGroup>

      <UFormGroup label="Password" name="password" required>
        <UInput
          v-model="userCredentials.password"
          placeholder="Enter Password"
          type="password"
          icon="i-heroicons-lock-closed" />
      </UFormGroup>
      <UButton type="submit">Login</UButton>
    </UForm>
  </UContainer>
</template>
