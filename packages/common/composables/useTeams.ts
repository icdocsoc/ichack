import { Result } from 'typescript-result';
import type { Team, TeamIdName, UserTeamStatus } from '#shared/types';

export default () => {
  const client = useHttpClient();
  const searchTeamsByName = async (teamname: string) =>
    Result.try(async () => {
      const res = await client.team.admin.searchTeam.$get({
        query: {
          teamName: teamname
        }
      });
      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage);
      }
      return (await res.json()) as TeamIdName[];
    });

  const searchTeamsByUser = async (userName: string) =>
    Result.try(async () => {
      const res = await client.team.admin.searchTeam.byPerson.$get({
        query: {
          personName: userName
        }
      });
      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage);
      }
      return (await res.json()) as UserTeamStatus[];
    });

  const getTeamDetails = async (teamid: string) =>
    Result.try(async () => {
      const res = await client.team.admin.getTeamData.$get({
        query: { teamId: teamid }
      });
      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage);
      }
      return await res.json();
    });

  //use team transfer put   (sudo as leader)
  const sudoTransferTeam = async (leaderId: string, newLeaderId: string) =>
    Result.try(async () => {
      const res = await client.team.transfer.$put(
        {
          json: { userId: newLeaderId }
        },
        {
          headers: {
            'X-sudo-user': leaderId
          }
        }
      );
      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage);
      }
    });

  // use acceptInvite post (sudo as invitee)
  const sudoAcceptInvite = async (teamid: number, userId: string) =>
    Result.try(async () => {
      const res = await client.team.acceptInvite.$post(
        {
          json: { teamId: teamid }
        },
        {
          headers: {
            'X-sudo-user': userId
          }
        }
      );
      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage);
      }
    });
  //use removeInvite post (sudo as invitee)
  const sudoRemoveInvite = async (teamid: number, userId: string) =>
    Result.try(async () => {
      const res = await client.team.removeInvite.$post(
        {
          json: { teamId: teamid }
        },
        {
          headers: {
            'X-sudo-user': userId
          }
        }
      );
      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage);
      }
    });
  //use removeUser post (sudo as leader)
  const sudoRemoveUser = async (leaderId: string, userId: string) =>
    Result.try(async () => {
      const res = await client.team.removeUser[':userId'].$post(
        {
          param: { userId: userId }
        },
        {
          headers: {
            'X-sudo-user': leaderId
          }
        }
      );
      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage);
      }
    });
  // add user invovles invite then  accept invite unless consider a direct route
  const sudoAddUser = async (userId: string, teamId: number) =>
    Result.try(async () => {
      const res = await client.team.admin.addUserToTeam.$post({
        json: { teamId: teamId, userId: userId }
      });
      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage);
      }
    });

  const sudoDisbandTeam = async (leaderId: string) =>
    Result.try(async () => {
      const res = await client.team.$delete(undefined, {
        headers: {
          'X-sudo-user': leaderId
        }
      });

      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage);
      }
    });

  const getOwnTeam = async () =>
    Result.try(async () => {
      const res = await client.team.$get();

      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage);
      }

      return await res.json();
    });

  const getTeamInvites = async () =>
    Result.try(async () => {
      const res = await client.team.invite.$get();

      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage);
      }

      return await res.json();
    });

  const getCategories = async () =>
    Result.try(async () => {
      const res = await client.category.$get();

      if (!res.ok) {
        return [];
      }

      return await res.json();
    });

  const createTeam = async (teamName: string) =>
    Result.try(async () => {
      const res = await client.team.$post({
        json: { teamName }
      });

      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage);
      }
    });

  type SearchQuery = { name: string | undefined; email: string | undefined };
  const hackerInviteSearch = async (search: string) =>
    Result.try(async () => {
      let query: SearchQuery = { name: undefined, email: undefined };

      if (search.includes('@')) {
        query.email = search;
      } else {
        query.name = search;
      }

      const req = await client.team.search.$get({ query });

      if (!req.ok) {
        throw new Error(await req.text());
      }

      return await req.json();
    });

  const updateOwnTeam = async (team: Team) =>
    Result.try(async () => {
      const res = await client.team.$put({
        json: { ...team }
      });

      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage);
      }
    });

  const removeTeammate = async (userId: string) =>
    Result.try(async () => {
      const res = await client.team.removeUser[':userId'].$post({
        param: { userId }
      });

      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage);
      }
    });

  const inviteTeammate = async (userId: string) =>
    Result.try(async () => {
      const res = await client.team.invite.$post({
        json: { userId }
      });

      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage);
      }
    });

  const leaveTeam = async () =>
    Result.try(async () => {
      const res = await client.team.removeUser.$post(undefined);

      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage);
      }
    });

  const disbandTeam = async () =>
    Result.try(async () => {
      const res = await client.team.$delete();

      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage);
      }
    });

  const acceptInvite = async (teamId: number) =>
    Result.try(async () => {
      const res = await client.team.acceptInvite.$post({
        json: { teamId }
      });

      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage);
      }
    });

  const declineInvite = async (teamId: number) =>
    Result.try(async () => {
      const res = await client.team.removeInvite.$post({
        json: { teamId }
      });

      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage);
      }
    });

  return {
    searchTeamsByName,
    searchTeamsByUser,
    sudoTransferTeam,
    sudoAcceptInvite,
    sudoRemoveInvite,
    sudoRemoveUser,
    sudoAddUser,
    sudoDisbandTeam,
    getTeamDetails,
    getOwnTeam,
    getTeamInvites,
    getCategories,
    createTeam,
    hackerInviteSearch,
    updateOwnTeam,
    removeTeammate,
    inviteTeammate,
    leaveTeam,
    disbandTeam,
    acceptInvite,
    declineInvite
  };
};
