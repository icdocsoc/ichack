<script lang="ts" setup>
  import { z } from 'zod';
  const userStore = useUserStore();
  const { $authRepo } = useNuxtApp();
  const router = useRouter();

  const userCredentials = reactive({
    email: '',
    password: ''
  });

  const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8)
  });

  const errors = ref({
    emailError: [] as string[],
    passwordError: [] as string[]
  });

  const validateSchema = () => {
    const validatedSchema = loginSchema.safeParse(userCredentials);
    if (!validatedSchema.success) {
      const error = validatedSchema.error.format();
      errors.value.emailError = error.email?._errors ?? [];
      errors.value.passwordError = error.password?._errors ?? [];
      return;
    }
    return validatedSchema.data;
  };

  const handleSubmit = async () => {
    try {
      const data = validateSchema();
      if (!data) return;
      const response = await $authRepo.loginUser(userCredentials);
      response.fold(
        userState => {
          userStore.setUser(userState);
          router.push('/');
        },
        error => {
          console.error(error);
        }
      );
    } catch (error) {
      console.log(error);
    }
    // handle form submission
  };
</script>
<template>
  <h2 class="font-semibold text-5xl text-center">Login Screen</h2>
  <div class="mb-4 p-10 justify-center grid grid-flow-row">
    <form
      :schema="loginSchema"
      :state="userCredentials"
      @submit.prevent="handleSubmit">
      <ICInputBasic
        v-model="userCredentials.email"
        placeholder="Enter Email"
        type="email"
        label="Email" />
      <div v-if="errors.emailError" class="text-red-500">
        {{ errors.emailError[0] }}
      </div>

      <ICInputPassword
        v-model="userCredentials.password"
        placeholder="Enter Password"
        label="Password" />
      <div v-if="errors.passwordError" class="text-red-500">
        {{ errors.passwordError[0] }}
      </div>

      <button
        type="submit"
        class="p-2 bg-blue-500 text-white font-bold rounded shadow-md hover:bg-blue-700">
        Login
      </button>
    </form>
  </div>
</template>
