import type { AuthRepository } from '@base/repository/authRepository';
import type { ProfileRepository } from '@base/repository/profileRepository';

export default function () {
  const config = useRuntimeConfig();
  const { resolveServerUrl } = useServerBaseUrl();

  const authRepo: AuthRepository = new HonoAuthRepo(
    resolveServerUrl(config.public.serverBaseUrl)
  );
  const profileRepo: ProfileRepository = new HonoProfileRepo(
    resolveServerUrl(config.public.serverBaseUrl)
  );

  return {
    authRepo,
    profileRepo
  };
}
