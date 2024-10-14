import type { AsyncDataOptions } from '#app';
import type { Result } from 'typescript-result';

/**
 * const { data, error, loading, fetch } = await useAsyncResult('key', () => handler())
 */
export default function <DataT, ErrorT extends Error>(
  key: string,
  handler: () => Promise<Result<DataT, ErrorT>>,
  options?: AsyncDataOptions<DataT>
) {
  return useAsyncData<DataT, ErrorT>(
    key,
    async () => {
      const result = await handler();
      return result.getOrThrow();
    },
    options
  );
}
