import { hc } from 'hono/client';
import type { PerryApi } from '#shared/types';

/*
 * The reason why different URLs are supplied here is because during server rendering, the
 * default fetch function used by `hc` does have the necessary context of the server's URL.
 * Therefore, the URL must be supplied manually. In the production environment, the URL may
 * have to change to use the actual server URL.
 * However, in the browser (client-side), the URL is relative to the current domain.
 */
export const client = hc<PerryApi>(
  import.meta.server ? 'http://localhost:3000/api' : '/api'
);
