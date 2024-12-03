import { defineStore } from 'pinia';
import type { Profile } from '~~/shared/types';

export const useProfileStore = defineStore('user', () => {
  const profile = ref<Profile | null>(null);

  const setProfile = (profileObj: Profile) => {
    profile.value = profileObj;
  };

  return {
    profile,
    setProfile
  };
});
