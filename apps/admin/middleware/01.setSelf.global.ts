export default defineNuxtRouteMiddleware(async (from, to) => {
  const { profileRepo } = useRepositories();
  const store = useUserStore();

  const selfResult = await profileRepo.getSelf();
  if (selfResult.isOk()) {
    store.setUser(selfResult.value);
  }
});
