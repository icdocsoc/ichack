import { Result } from 'typescript-result';
import type { AdminMetadata } from '~~/shared/types';

export default () => {
  const client = useHttpClient();

  const setMealNumber = (mealNumber: number): Promise<Result<void, Error>> =>
    Result.try(async () => {
      const res = await client.admin.mealNumber.$put({
        json: { mealNumber }
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message);
      }
    });

  const getMetaDataInfo = (): Promise<Result<AdminMetadata, Error>> =>
    Result.try(async () => {
      const res = await client.admin.$get();

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message);
      }

      const metadata = await res.json();
      return metadata;
    });

  return { setMealNumber, getMetaDataInfo };
};
