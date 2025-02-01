import { Result } from 'typescript-result';
import type { TeamIdName, UserTeamStatus } from '#shared/types';

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

  return {
    searchTeamsByName,
    searchTeamsByUser,
    sudoTransferTeam,
    sudoAcceptInvite,
    sudoRemoveInvite,
    sudoRemoveUser,
    sudoAddUser,
    sudoDisbandTeam,
    getTeamDetails
  };
};
