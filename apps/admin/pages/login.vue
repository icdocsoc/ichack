<script lang="ts" setup>
  import { useVuelidate } from '@vuelidate/core';
  import { required, email, helpers } from '@vuelidate/validators';
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
    v$.value.$errors.forEach((error: any) => console.log(error.$message));
    return !v$.value.$error;
  };
  // checks if the form is valid and sends a POST request to the server
  const login = async () => {
    const valid = checkValid();
    if (!valid) {
      console.error('Invalid details supplied');
      return;
    }
    try {
      const response = await $fetch('/api/auth/login', {
        method: 'POST',
        body: userCredentials
      });
    } catch (err) {
      console.error('Error with logging in: ', err);
    }
  };
</script>

<template>
  <h2 class="font-semibold text-5xl text-center">Login Screen</h2>
  <div class="mb-4 p-10 justify-center grid grid-flow-row">
    <div class="pb-2">
      <TextInputField
        v-model="userCredentials.email"
        placeholderTxt="Enter Email"
        name="Email"
        type="text" />
      <!-- will display error messages generated during validation if any -->
      <div class="text-red-500" v-if="v$.email.$error">
        {{ v$.email.$errors[0].$message }}
      </div>
    </div>

    <div class="pb-2">
      <TextInputField
        v-model="userCredentials.password"
        placeholderTxt="Enter Password"
        name="Password"
        type="password" />

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
