<script setup lang="ts">
import eyeOpen from '@ui25/assets/eye-open.svg';
import eyeClose from '@ui25/assets/eye-close.svg';

type Prop = {
  error?: string;
  placeholder?: string;
  required?: boolean;
  name?: string;
  enableShowPassword?: boolean;
};
const { enableShowPassword = false } = defineProps<Prop>();
const model = defineModel();

const showPassword = ref(false);
</script>

<template>
  <div class="relative">
    <ICInput
      class="w-full"
      :type="enableShowPassword && showPassword ? 'text' : 'password'"
      :name="name"
      :error="error"
      :required="required"
      :placeholder="placeholder"
      v-model="model" />

    <img
      v-if="enableShowPassword"
      :src="showPassword ? eyeOpen : eyeClose"
      alt="Show Password"
      @click="showPassword = !showPassword"
      class="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer" />
  </div>
</template>
