export default defineNuxtRouteMiddleware((to, _from) => {
  const store = useProfileStore();

  if (to.fullPath.startsWith('/admin')) {
    if (!store.profile) {
      return navigateTo({
        path: '/login',
        query: {
          redirect: to.fullPath
        }
      });
    }
    if (store.profile.role !== 'admin' && store.profile.role !== 'god') {
      return abortNavigation({
        statusCode: 403,
        statusMessage: 'You do not have permission to access this page',
        fatal: true
      });
    }
  }
});
