import factory from '../factory';
import { grantAccessTo } from '../security';
import { db } from '../drizzle';
import {
  teamInvites,
  teams,
  teamMembers,
  type TeamInvite,
  type TeamMember,
  type TeamIdName,
  type UserTeamStatus
} from './schema';
import { eq, ilike, sql } from 'drizzle-orm';
import { users } from '../auth/schema';
import { z } from 'zod';
import { alias } from 'drizzle-orm/pg-core';
import { simpleValidator } from '../validators';
import { MAX_TEAM_SIZE } from '.';
import { Result } from 'typescript-result';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { qrs } from '../qr/schema';

type TxRes = {
  msg: string;
  status: ContentfulStatusCode;
};

//search by member name in team and invites returning id, name, team name, and status
const adminSearchTeamByUsername = (name: string) => {
  // get all users with 'name like name'
  const userCte = db
    .select({
      userId: sql<string>`users.id`.as('userId'),
      userName: users.name
    })
    .from(users)
    .where(ilike(users.name, `%${name}%`))
    .as('user_cte');

  // get all invites with user id, user name, team name, team id, and status
  const invitesCte = db
    .select({
      userId: userCte.userId,
      userName: userCte.userName,
      teamName: teams.teamName,
      teamId: teams.id,
      status: sql<'leader' | 'member' | 'invited'>`'invited'`.as('status')
    })
    .from(teamInvites)
    .innerJoin(teams, eq(teamInvites.teamId, teams.id))
    .innerJoin(userCte, eq(teamInvites.userId, userCte.userId))
    .as('invites_cte');
  // get all members with user id, user name, team name, team id, and status
  const membersCte = db
    .select({
      userId: userCte.userId,
      userName: userCte.userName,
      teamName: teams.teamName,
      teamId: teams.id,
      status: sql<
        'leader' | 'member' | 'invited'
      >`(CASE WHEN is_leader THEN 'leader' ELSE 'member' END)`.as('status')
    })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .innerJoin(userCte, eq(teamMembers.userId, userCte.userId))
    .as('members_cte');
  // union data to make the search results.
  return db
    .select()
    .from(invitesCte)
    .unionAll(db.select().from(membersCte))
    .prepare('searchByName');
};

// return all data from teams table + all members of the team + all invites to the team
const selectTeamFromIdQueryDriz = (idTarget: number) => {
  const invitedUsers = alias(users, 'invitedUsers');
  return db
    .select({
      teamData: teams,
      members: sql<TeamMember[]>`json_agg(DISTINCT jsonb_build_object(
        'userId', ${teamMembers.userId},
        'memberName', ${users.name},
        'isLeader', ${teamMembers.isLeader}
      ))`,
      invites: sql<TeamInvite[]>`json_agg(DISTINCT jsonb_build_object(
        'userId', ${teamInvites.userId},
        'invitedUserName', ${invitedUsers.name}
      ))`
    })
    .from(teams)
    .leftJoin(teamMembers, eq(teamMembers.teamId, teams.id))
    .leftJoin(users, eq(teamMembers.userId, users.id))
    .leftJoin(teamInvites, eq(teamInvites.teamId, teams.id))
    .leftJoin(invitedUsers, eq(teamInvites.userId, invitedUsers.id))
    .groupBy(teams.id)
    .where(eq(teams.id, idTarget));
};

const adminSearchByTeamName = (name: string) =>
  db
    .select({
      teamId: teams.id,
      teamName: teams.teamName
    })
    .from(teams)
    .where(ilike(teams.teamName, `%${name}%`))
    .prepare('searchByTeamName');

const teamAdmin = factory
  .createApp()
  .get(
    '/searchTeam',
    grantAccessTo(['admin']),
    simpleValidator(
      'query',
      z
        .object({
          teamName: z.string()
        })
        .strict()
    ),
    async ctx => {
      // returns a list of team names with a partial match to the team name input
      const { teamName } = ctx.req.valid('query');

      const teams: TeamIdName[] =
        await adminSearchByTeamName(teamName).execute();
      if (!teams.length) return ctx.text('Team not found.', 404);

      return ctx.json(teams, 200);
    }
  )
  .get(
    '/searchTeam/byPerson',
    grantAccessTo(['admin']),
    simpleValidator(
      'query',
      z.object({
        personName: z.string()
      })
    ),
    async ctx => {
      // returns a list of teams along with the associated members name and status
      const { personName } = ctx.req.valid('query');

      const searchRes: UserTeamStatus[] =
        await adminSearchTeamByUsername(personName).execute();

      if (!searchRes.length) return ctx.text('User not found.', 404);

      return ctx.json(searchRes, 200);
    }
  )
  .get(
    '/getTeamData',
    grantAccessTo(['admin']),
    simpleValidator(
      'query',
      z.object({
        teamId: z.coerce.number().min(1)
      })
    ),
    async ctx => {
      // Returns all data for a team, including members and invites
      const { teamId } = ctx.req.valid('query');

      const teamData = await selectTeamFromIdQueryDriz(teamId).execute();
      if (!teamData.length) return ctx.text('Team not found.', 404);

      return ctx.json(teamData[0]!, 200);
    }
  )
  .post(
    '/addUserToTeam',
    grantAccessTo(['admin']),
    simpleValidator(
      'json',
      z.object({
        teamId: z.number(),
        userId: z.string()
      })
    ),
    async ctx => {
      // Adds a user to a team

      const { teamId, userId } = ctx.req.valid('json');

      const linked = await db.select().from(qrs).where(eq(qrs.userId, userId));
      if (!linked.length) return ctx.text('User not linked to QR code.', 404);

      const user = await db.select().from(users).where(eq(users.id, userId));
      if (!user.length) return ctx.text('User not found.', 404);
      if (user[0]!.role !== 'hacker')
        return ctx.text('User is not a hacker.', 409);

      const transaction: TxRes = await db.transaction(async tx => {
        const members = await tx
          .select()
          .from(teamMembers)
          .where(eq(teamMembers.teamId, teamId));

        if (members.length >= MAX_TEAM_SIZE) {
          return {
            msg: 'Team is full.',
            status: 409
          };
        } else if (members.length === 0) {
          return {
            msg: 'Team not found.',
            status: 404
          };
        }

        try {
          await tx.insert(teamMembers).values({
            teamId,
            userId,
            isLeader: false
          });
        } catch {
          // violating primary key
          // don't need to rollback as we've only done a select prior
          return {
            msg: 'User already in team.',
            status: 409
          };
        }

        // Team is now full; remove invites
        if (members.length === MAX_TEAM_SIZE - 1) {
          await tx.delete(teamInvites).where(eq(teamInvites.teamId, teamId));
        }

        await tx.delete(teamInvites).where(eq(teamInvites.userId, userId));

        return {
          msg: 'User added to team.',
          status: 200
        };
      });

      return ctx.text(transaction.msg, transaction.status);
    }
  );

export default teamAdmin;
