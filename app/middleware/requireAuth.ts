export default defineNuxtRouteMiddleware(async () => {
  const store = useProfileStore();
  const { getSelf } = useProfile();

  if (store.profile == null) {
    const profileResult = await getSelf();
    if (profileResult.isOk()) {
      store.setProfile(profileResult.value);
    }
  }

  if (store.profile == null) return navigateTo('/login');
});
