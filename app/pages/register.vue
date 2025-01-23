<template>
  <div class="mt-20 flex flex-col space-y-4">
    <h1 class="font-ichack my-4 text-center text-4xl">Complete Sign Up</h1>

    <form @submit.prevent="handleRegister">
      <div class="grid max-w-6xl gap-8 place-self-center md:grid-cols-2">
        <div class="flex flex-col gap-4">
          <RegisterGroup :icon="mailSvg">
            <div class="relative w-full cursor-not-allowed">
              <ICInput
                type="email"
                name="email"
                disabled
                class="w-full font-bold"
                placeholder="Email"
                v-model="user.email" />
              <div
                class="absolute left-0 top-0 h-full w-full bg-gray-400 opacity-40"></div>
            </div>
          </RegisterGroup>

          <RegisterGroup :icon="mugshotSvg">
            <div class="relative w-full cursor-not-allowed">
              <ICInput
                type="text"
                name="name"
                disabled
                class="w-full font-bold"
                placeholder="Name"
                v-model="user.name" />

              <div
                class="absolute left-0 top-0 h-full w-full bg-gray-400 opacity-40"></div>
            </div>

            <ICInput
              type="text"
              name="pronouns"
              placeholder="Pronouns"
              v-model="formState.pronouns" />
          </RegisterGroup>

          <RegisterGroup :icon="gradhatSvg">
            <ICInputSelect
              name="place-of-study"
              placeholder="Place Of Study"
              class="w-full"
              v-model="demographicsState.university"
              :options="sameName(universities)" />
          </RegisterGroup>

          <RegisterGroup :icon="lockSvg">
            <div class="relative w-full">
              <ICInput
                class="w-full"
                :type="showPassword ? 'text' : 'password'"
                name="password"
                :error="errors.password"
                required
                placeholder="Password *"
                v-model="formState.password" />

              <img
                :src="showPassword ? eyeOpen : eyeClose"
                alt="Show Password"
                @click="showPassword = !showPassword"
                class="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer" />
            </div>

            <ICInput
              type="password"
              name="cfmpassword"
              required
              :error="errors.cfmPassword"
              v-model="formState.cfmPassword"
              placeholder="Confirm Password *" />
          </RegisterGroup>

          <ICInputFile
            title="Upload your CV"
            accept="application/pdf"
            :icon="cvSvg"
            v-model="cv" />

          <ICInputCheckbox
            title="Photos Opt Out"
            description="Please grab a sticker on the day as well."
            name="photos_opt_out"
            v-model="formState.photos_opt_out" />
        </div>

        <div class="flex flex-col gap-4">
          <RegisterGroup :icon="info">
            <ICInputSelect
              name="gender-identity"
              placeholder="Gender Identity"
              v-model="demographicsState.gender"
              :options="sameName(genders)" />
          </RegisterGroup>

          <RegisterGroup :icon="course">
            <ICInputSelect
              name="course-of-study"
              placeholder="Course of Study"
              class="w-full"
              v-model="demographicsState.courseOfStudy"
              :options="sameName(courses)" />
          </RegisterGroup>

          <RegisterGroup :icon="year">
            <ICInputSelect
              name="year-of-study"
              placeholder="Year of Study"
              v-model="demographicsState.yearOfStudy as string"
              :options="sameName(yearsOfStudy)" />
          </RegisterGroup>

          <RegisterGroup :icon="shirt">
            <ICInputSelect
              name="t-shirt-size"
              required
              placeholder="T-Shirt Size *"
              v-model="formState.tShirtSize"
              :options="sameName(tShirtSizes)" />
          </RegisterGroup>

          <RegisterGroup :icon="cake">
            <ICInput
              type="number"
              placeholder="Age"
              name="age"
              min="18"
              v-model="demographicsState.age"
              :max="oldestPersonAge" />
          </RegisterGroup>

          <RegisterGroup :icon="yum" class="transition-all">
            <ICInputMultiselect
              title="Dietary Restrictions"
              name="dietary-restrictions"
              v-model="formState.dietary_restrictions"
              :options="dietaryRestrictionValues"
              :other="true" />
          </RegisterGroup>
        </div>
      </div>

      <div
        class="flex w-full flex-col place-items-center gap-y-2 place-self-center pt-8">
        <ICInputCheckbox
          class="w-full max-w-3xl md:w-[75%]"
          title="I accept the code of conduct."
          description="By ticking this box, you accept the ICHack <u><a href='https://ichack.org/code-of-conduct' target='_blank'>code of conduct</a></u>, certify you have read the <u><a href='https://ichack.org/privacy-policy' target='_blank'>privacy policy</a></u>, and certify you are over the age of 18. Additionally, you confirm you have read and understand <u><a href='' target='_blank'>the fire safety and onboarding documents</a></u>."
          name="code-of-conduct"
          v-model="legalStuff" />

        <input
          type="submit"
          value="Submit"
          class="bg-blue-ic hover:bg-red-ic w-[50%] py-5 text-2xl font-extrabold transition-colors duration-500 hover:cursor-pointer focus:bg-red-700 md:w-[30%]" />
        <p class="pb-8 text-center text-gray-500">
          Gender, university, course, year, T-Shirt size, and age will be
          anonymized.
        </p>
      </div>
    </form>

    <ICError v-model="errors.global" />
  </div>
</template>

<script setup lang="ts">
import mailSvg from '@ui25/assets/mail.svg';
import mugshotSvg from '@ui25/assets/mugshot.svg';
import gradhatSvg from '@ui25/assets/gradhat.svg';
import lockSvg from '@ui25/assets/lock.svg';
import eyeOpen from '@ui25/assets/eye-open.svg';
import eyeClose from '@ui25/assets/eye-close.svg';
import cvSvg from '@ui25/assets/cv.svg';
import info from '@ui25/assets/info.svg';
import course from '@ui25/assets/course.svg';
import year from '@ui25/assets/year.svg';
import shirt from '@ui25/assets/shirt.svg';
import cake from '@ui25/assets/cake.svg';
import yum from '@ui25/assets/yum.svg';
import {
  newDemographSchema,
  passwordPattern,
  registerProfileSchema
} from '#shared/schemas';
import { z } from 'zod';
import { tShirtSizes, genders, yearsOfStudy } from '#shared/types';
import { courses, universities } from '~/assets/demographics.json';

const route = useRoute();
const token = `${route.query.token}`;
// As of Jan 2025, this is Inah Canabarro Lucas of Brazil.
// I doubt he will attend.
const oldestPersonAge = 116;

const dietaryRestrictionValues = [
  'Vegetarian',
  'Vegan',
  'Halal',
  'Kosher',
  'Milk Free',
  'Nut Free',
  'Gluten Free'
];

const sameName = (values: readonly string[]) =>
  values.map(v => {
    return {
      displayName: v,
      value: v
    };
  });

const showPassword = ref(false);
const cv = ref<File | undefined>(undefined);

const legalStuff = ref(false);

/* pre-fill the data */
const { user: _user } = useRegistrationUser();
const user = computed(() => _user.value!); // non-null assertion by valid-token middleware

// Registration variables
const errors = reactive({
  global: '',
  password: '',
  cfmPassword: '',
  tShirtSize: ''
});

// You can't refine then extend again, hence this is like this.
const formSchema = registerProfileSchema.extend({
  cfmPassword: z.string().regex(passwordPattern)
});

const formStateSchema = formSchema
  .extend({
    tShirtSize: z.string()
  })
  .refine(data => data.password === data.cfmPassword, {
    message: 'Passwords do not match.',
    path: ['cfmPassword']
  });

const formCheckSchema = formSchema.refine(
  data => data.password === data.cfmPassword,
  {
    message: 'Passwords do not match.',
    path: ['cfmPassword']
  }
);

const formState = reactive<z.infer<typeof formStateSchema>>({
  password: '',
  cfmPassword: '',
  photos_opt_out: false,
  dietary_restrictions: [],
  pronouns: '',
  tShirtSize: ''
});

const optionalDemograhpicsSchema = newDemographSchema.omit({
  tShirtSize: true
});

// Specifically undefined, we would rather a null entry than a '' entry in the DB.
const demographicsState = reactive<
  Record<keyof z.infer<typeof optionalDemograhpicsSchema>, string | undefined>
>({
  gender: undefined,
  university: undefined,
  courseOfStudy: undefined,
  yearOfStudy: undefined,
  age: undefined
});

const handleRegister = async () => {
  // First stage validation
  const validation = await formCheckSchema.safeParseAsync(formState);
  if (!validation.success) {
    const errorObj = validation.error.flatten();
    const errs = [];
    if (errorObj.fieldErrors.password) {
      errors.password = errorObj.fieldErrors.password?.join('; ') ?? '';
      errs.push(errors.password);
    }

    if (errorObj.fieldErrors.cfmPassword) {
      errors.cfmPassword = errorObj.fieldErrors.cfmPassword?.join('; ') ?? '';
      errs.push('Passwords do not match.');
    }

    if (errorObj.fieldErrors.tShirtSize) {
      errors.tShirtSize = errorObj.fieldErrors.tShirtSize?.join('; ') ?? '';
      errs.push('Please input your T-Shirt size.');
    }

    errors.global = errs.join('\n');
    return;
  }

  if (!legalStuff.value) {
    errors.global = 'Please read and accept the code of conduct.';
    return;
  }

  // This shouldn't need to be validated; it will work as long as you didn't mess up the vaules yourself,
  // in which case deal with it yourself.
  const demograhpicsValues =
    optionalDemograhpicsSchema.safeParse(demographicsState);
  if (!demograhpicsValues.success) {
    errors.global =
      "If you're seeing this, you either messed with the values yourself, or something has gone terribly wrong - contact us if it is the latter case.";
    return;
  }

  errors.password = '';
  errors.cfmPassword = '';
  errors.tShirtSize = '';
  errors.global = '';

  const { cfmPassword, ...details } = validation.data;
  const { register } = useProfile();
  const result = await register(
    token,
    {
      ...details,
      ...demograhpicsValues.data
    },
    cv.value
  );

  if (result.error) {
    errors.global = result.error.message;
    return;
  }

  switch (user.value.role) {
    case 'hacker':
      navigateTo('/');
      break;
    case 'god':
    case 'admin':
      navigateTo('/admin');
    case 'volunteer':
      navigateTo(`/volunteer`);
      break;
  }
};

definePageMeta({
  middleware: ['valid-token'],
  layout: 'public'
});

useHead({
  title: 'Register'
});
</script>
