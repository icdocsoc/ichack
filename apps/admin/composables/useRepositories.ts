import type { AuthRepository } from '@base/repository/authRepository';

export default function () {
  const config = useRuntimeConfig();
  const { resolveServerUrl } = useServerBaseUrl();

  const authRepo: AuthRepository = new HonoAuthRepo(
    resolveServerUrl(config.public.serverBaseUrl)
  );

  return {
    authRepo
  };
}
