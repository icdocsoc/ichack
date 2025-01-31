export default defineNuxtRouteMiddleware(async (to, _from) => {
  const { getOwnQr } = useQR();
  const result = await getOwnQr();

  if (result.isError()) return navigateTo('/ticket'); // TODO where to go to?
});
