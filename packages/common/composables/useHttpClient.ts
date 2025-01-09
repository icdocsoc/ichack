import { hc } from 'hono/client';
import type { PerryApi } from '#shared/types';

export default function useHttpClient() {
  const headers = useRequestHeaders();
  const runtimeConfig = useRuntimeConfig();

  const requestURL = runtimeConfig.public.apiBaseUrl;

  return hc<PerryApi>(requestURL, { headers });
}
