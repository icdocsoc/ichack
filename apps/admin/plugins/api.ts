export default defineNuxtPlugin(_ => {
  const { serverBaseUrl } = useRuntimeConfig();

  // Auto-imported from the base layer
  const authRepo = new HonoAuthRepo(serverBaseUrl);

  return {
    provide: {
      authRepo
    }
  };
});
