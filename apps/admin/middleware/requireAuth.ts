export default defineNuxtRouteMiddleware(async () => {
  const store = useUserStore();

  if (store.user == null) return abortNavigation('you canot access this page');
});
