import { Result } from 'typescript-result';
import type { Hackspace } from '~~/server/src/types';
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

  const updateHackspaceChallenge = (
    name: string,
    qtr?: number,
    scr?: number,
    jcr?: number
  ) =>
    Result.try(async () => {
      const res = await client.hackspace.challenge.$put({
        json: { name, qtr, scr, jcr }
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message);
      }

      return res;
    });

  const createHackspaceChallenge = (
    name: string,
    qtr?: number,
    scr?: number,
    jcr?: number
  ) =>
    Result.try(async () => {
      const res = await client.hackspace.challenge.$post({
        json: { name, qtr, scr, jcr }
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message);
      }

      return res;
    });

  const deleteHackspaceChallenge = (name: string) =>
    Result.try(async () => {
      const res = await client.hackspace.challenge.$delete({
        json: { name }
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message);
      }

      return res;
    });

  const getHackspaceUsers = () =>
    Result.try(async () => {
      const res = await client.hackspace.users.$get(undefined);

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message);
      }

      return res.json();
    });

  const updateHackspaceUser = (
    id: string,
    hackspace?: Hackspace,
    points?: number
  ) =>
    Result.try(async () => {
      const res = await client.hackspace.users[':id'].$put({
        json: { hackspace, points },
        param: { id }
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message);
      }

      return res;
    });

  const setCanSubmit = (canSubmit: boolean) =>
    Result.try(async () => {
      const res = await client.admin.allowSubmissions.$put({
        json: { allowSubmissions: canSubmit }
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message);
      }
    });

  return {
    setMealNumber,
    getMetaDataInfo,
    updateHackspaceChallenge,
    createHackspaceChallenge,
    deleteHackspaceChallenge,
    getHackspaceUsers,
    updateHackspaceUser,
    setCanSubmit
  };
};
