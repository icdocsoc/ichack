import useProfile from '~/composables/useProfile';

export default defineNuxtRouteMiddleware(async (from, to) => {
  const { getSelf } = useProfile();
  const store = useProfileStore();
  const selfResult = await getSelf();
  if (selfResult.isOk()) {
    store.setProfile(selfResult.value);
  }
});
