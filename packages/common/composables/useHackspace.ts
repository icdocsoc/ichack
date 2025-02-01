import { Result } from 'typescript-result';
import type { Hackspace } from '~~/server/src/types';

export default () => {
  const client = useHttpClient();

  const getHackspaceChallenges = () =>
    Result.try(async () => {
      const res = await client.hackspace.challenges.$get();

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message);
      }

      const challenges = await res.json();
      challenges.sort((a, b) => a.name.localeCompare(b.name));

      return challenges;
    });

  const getHackspaceScores = () =>
    Result.try(async () => {
      const res = await client.hackspace.scores.$get();

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message);
      }

      return await res.json();
    });

  const joinHackspace = (hackspace: Hackspace) =>
    Result.try(async () => {
      const res = await client.hackspace.$post({ json: { hackspace } });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message);
      }
    });

  const validateUserHackspace = (userid: string) =>
    Result.try(async () => {
      const res = await client.hackspace.users[':id'].$get({
        param: { id: userid }
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      if (!json.hackspace)
        throw new Error('User not in a hackspace! please ask them to join one');
    });

  const updateHackspace = (hackspace: Hackspace) =>
    Result.try(async () => {
      const res = await client.hackspace.$put({ json: { hackspace } });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message);
      }
    });

  return {
    getHackspaceChallenges,
    getHackspaceScores,
    joinHackspace,
    updateHackspace,
    validateUserHackspace
  };
};
