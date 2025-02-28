import { Result } from 'typescript-result';
import type { Profile } from '#shared/types';

export const useQR = () => {
  const client = useHttpClient();

  const deleteQR = (id: string): Promise<Result<void, Error>> => {
    return Result.try(async () => {
      const res = await client.qr[':id'].$delete({
        param: { id }
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(`Server error: ${message}`);
      }
    });
  };

  const getOwnQr = async (): Promise<Result<void, Error>> => {
    return Result.try(async () => {
      const result = await client.qr.$get();

      if (!result.ok) {
        const errorMessage = await result.text();
        throw new Error(errorMessage);
      }
      return Result.ok();
    });
  };

  const getQr = (uuid: string): Promise<Result<Profile, Error>> => {
    return Result.try(async () => {
      const res = await client.qr[':uuid'].$get({
        param: { uuid: uuid }
      });
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    });
  };

  return {
    deleteQR,
    getOwnQr,
    getQr
  };
};
