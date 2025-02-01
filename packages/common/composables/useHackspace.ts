import { Result } from 'typescript-result';

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

  return { getHackspaceChallenges, getHackspaceScores };
};
