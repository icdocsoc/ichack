<script lang="ts" setup>
import { passwordPattern } from '~~/shared/types';
import { z } from 'zod';
import useAuth from '~/composables/useAuth';

const { loginUser, logOut } = useAuth();
const profileStore = useProfileStore();

const userCredentials = reactive({
  email: '',
  password: ''
});
const loginSchema = z.object({
  email: z
    .string({ message: 'Email is required' })
    .email('Invalid email address'),
  password: z
    .string({ message: 'Password is required' })
    .regex(
      passwordPattern,
      'Password must contain at least 8 characters with one lowercase letter, one uppercase letter and one number'
    )
});
const errors = ref({
  emailError: [] as string[],
  passwordError: [] as string[]
});
const handleLogin = async () => {
  const validateSchema = async () => {
    const validatedSchema = await loginSchema.safeParseAsync(userCredentials);
    if (!validatedSchema.success) {
      const error = validatedSchema.error.format();
      errors.value.emailError = error.email?._errors ?? [];
      errors.value.passwordError = error.password?._errors ?? [];
      return;
    }
    return validatedSchema.data;
  };

  try {
    const data = validateSchema();
    if (!data) return;

    const response = await loginUser(userCredentials);
    response.fold(
      userState => {
        console.log('We here =)');
        profileStore.setProfile(userState);
        navigateTo('/');
      },
      error => {
        console.error(error);
      }
    );
  } catch (error) {
    console.log('we here =(');
    console.log(error);
  }
  // handle form submission
};
</script>

<template>
  <h2 class="font-semibold text-5xl text-center">Login Screen</h2>
  <UContainer class="flex flex-col justify-center items-center">
    <UForm :schema="loginSchema" :state="userCredentials" @submit="handleLogin">
      <UFormGroup label="Email" required>
        <UInput
          v-model="userCredentials.email"
          placeholder="Enter Email"
          type="email"
          icon="i-heroicons-envelope" />
      </UFormGroup>

      <UFormGroup label="Password" required>
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
