export default defineNuxtRouteMiddleware(async (from, to) => {
  const { authRepo } = useRepositories();
  const store = useUserStore();

  const selfResult = await authRepo.getSelf();
  if (selfResult.isOk()) {
    store.setUser(selfResult.value);
  }
});
