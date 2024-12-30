import { useLocalStorage } from '@vueuse/core';

export default function (key: string) {
  return useLocalStorage(`visited-before-${key}`, false);
}
