import type { UserState } from '@shared/types';
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', () => {
  const user: Ref<UserState | null> = ref(null);

  const updateUser = (userObj: UserState) => {
    user.value = userObj;
  };

  return {
    user,
    updateUser
  };
});
