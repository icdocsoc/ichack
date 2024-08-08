export default defineNuxtPlugin(_ => {
  const { serverBaseUrl } = useRuntimeConfig().public;
  // Auto-imported from the base layer
  const authRepo = new HonoAuthRepo(serverBaseUrl);

  return {
    provide: {
      authRepo
    }
  };
});
