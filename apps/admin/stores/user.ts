import type { User } from '@shared/types';
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null);

  const setUser = (userObj: User) => {
    user.value = userObj;
  };

  return {
    user,
    setUser
  };
});
