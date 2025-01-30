import { Result } from 'typescript-result';

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

  return {
    deleteQR
  };
};
