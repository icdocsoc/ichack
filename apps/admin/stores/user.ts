import type { UserState } from '@shared/types';
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', () => {
  const user = ref<UserState | null>(null);

  const setUser = (userObj: UserState) => {
    user.value = userObj;
  };

  return {
    user,
    setUser
  };
});
