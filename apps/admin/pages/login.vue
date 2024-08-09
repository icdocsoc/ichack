<script lang="ts" setup>
  import { useVuelidate } from '@vuelidate/core';
  import { required, email, helpers } from '@vuelidate/validators';

  const { $authRepo } = useNuxtApp();
  const userStore = useUserStore();
  const userCredentials = reactive({
    email: '',
    password: ''
  });
  const rules = computed(() => {
    return {
      email: {
        required: helpers.withMessage('Email is required', required),
        email: helpers.withMessage('Email must be valid', email)
      },
      password: {
        required: helpers.withMessage('Password is required', required)
      }
    };
  });

  const v$ = useVuelidate(rules, userCredentials);
  // validates the form using the rules and logs any errors
  const checkValid = () => {
    v$.value.$validate();
    return !v$.value.$error;
  };
  // checks if the form is valid and sends a POST request to the server
  const login = async () => {
    const valid = checkValid();
    if (!valid) {
      return;
    }

    const response = await $authRepo.loginUser(userCredentials);
    // handling the success case and storing user object in pinia
    // handling the error case by logging to console
    response.fold(
      userState => {
        userStore.setUser(userState);
      },
      error => {
        console.error(error); // TODO handle error better
      }
    );
  };
</script>

<template>
  <h2 class="font-semibold text-5xl text-center">Login Screen</h2>
  <div class="mb-4 p-10 justify-center grid grid-flow-row">
    <div class="pb-2">
      <ICInputBasic
        v-model="userCredentials.email"
        placeholder="Enter Email"
        type="email"
        label="Email" />
      <!-- will display error messages generated during validation if any -->
      <div data-testid="emailError" class="text-red-500" v-if="v$.email.$error">
        {{ v$.email.$errors[0].$message }}
      </div>
    </div>

    <div class="pb-2">
      <ICInputPassword
        v-model="userCredentials.password"
        placeholder="Enter Password"
        label="Password" />

      <div class="text-red-500" v-if="v$.password.$error">
        {{ v$.password.$errors[0].$message }}
      </div>
    </div>
    <button
      @click.prevent="login"
      class="p-2 bg-blue-500 text-white font-bold rounded shadow-md hover:bg-blue-700">
      Login
    </button>
  </div>
</template>
