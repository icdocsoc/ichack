export default defineNuxtRouteMiddleware(async (to, _from) => {
  const token = to.query.token;
  if (!token || typeof token !== 'string') {
    throw createError({
      statusCode: 404,
      statusMessage: 'Token not supplied',
      fatal: true
    });
  }

  const { fetchUserByToken } = useRegistrationUser();
  try {
    await fetchUserByToken(token);
  } catch (error) {
    throw createError({
      statusCode: 404,
      statusMessage: (error as Error).message,
      fatal: true
    });
  }
});
