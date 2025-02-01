export default defineNuxtRouteMiddleware(async (to, _from) => {
  const store = useProfileStore();
  if (store.profile!.role !== 'hacker') return;

  const { getOwnQr } = useQR();
  const result = await getOwnQr();

  if (result.isError()) return navigateTo('/onboarding');
});
