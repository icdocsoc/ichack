import { Result } from 'typescript-result';
import type { Category } from '#shared/types';

export default function useCategories() {
  const client = useHttpClient();

  async function getCategory(slug: string): Promise<Result<Category, Error>> {
    return Result.try(async () => {
      const res = await client.category[':slug'].$get({
        param: { slug }
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message);
      }

      return await res.json();
    });
  }

  async function getAllCategories(): Promise<Result<Category[], Error>> {
    return Result.try(async () => {
      const res = await client.category.$get();

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message);
      }

      return await res.json();
    });
  }

  const getJudging = async () =>
    Result.try(async () => {
      const res = await client.category.judging.$get();

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message);
      }

      return await res.json();
    });

  const getAllJudging = async () =>
    Result.try(async () => {
      const res = await client.category.judging.all.$get();

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message);
      }

      return await res.json();
    });

  return {
    getCategory,
    getAllCategories,
    getJudging,
    getAllJudging
  };
}
