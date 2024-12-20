import factory from '../factory';
import { grantAccessTo } from '../security';
import { db } from '../drizzle';
import { teamInvites, teams, updateTeamSchema, teamMembers } from './schema';
import { and, eq, ilike, not, or, sql } from 'drizzle-orm';
import { users } from '../auth/schema';
import { apiLogger } from '../logger';
import { z } from 'zod';
import { simpleValidator } from '../validators';

// TODO: Move to `admin` table.
const MAX_TEAM_SIZE = 6;

const userIdSchema = z
  .object({
    userId: z.string()
  })
  .strict();
const teamIdSchema = z
  .object({
    teamId: z.number()
  })
  .strict();

const selectTeamLinkFromMember = db
  .select()
  .from(teamMembers)
  .where(eq(teamMembers.userId, sql.placeholder('userId')))
  .prepare('selectTeamFromMember');

// I don't like this.
const selectTeamFromLeader = db
  .select({
    id: teams.id,
    teamName: teams.teamName,
    sponsorCategory: teams.sponsorCategory,
    docsocCategory: teams.docsocCategory,
    submissionLink: teams.submissionLink,
    phone: teams.phone,
    phone2: teams.phone2
  })
  .from(teamMembers)
  .where(
    and(
      eq(teamMembers.userId, sql.placeholder('userId')),
      eq(teamMembers.isLeader, true)
    )
  )
  .innerJoin(teams, eq(teams.id, teamMembers.teamId))
  .prepare('selectTeamFromLeader');

const team = factory
  .createApp()
  .post(
    '/',
    simpleValidator('json', z.object({ teamName: z.string() })),
    grantAccessTo('hacker'),
    async ctx => {
      // Creates a team in the DB using supplied team, and user who requested as leader.
      const user = ctx.get('user')!;
      const body = ctx.req.valid('json');

      const currentTeam = await selectTeamLinkFromMember.execute({
        userId: user.id
      });
      if (currentTeam.length > 0) {
        return ctx.text('You are already in a team', 400);
      }

      const teamId = await db.transaction(async tx => {
        const createdTeam = await tx
          .insert(teams)
          .values({
            teamName: body.teamName
          })
          .returning();

        await tx
          .insert(teamMembers)
          .values({
            userId: user.id,
            teamId: createdTeam[0]!.id,
            isLeader: true
          })
          .returning();

        return createdTeam[0]!.id;
      });

      return ctx.json(
        {
          id: teamId
        },
        201
      );
    }
  )
  .put(
    '/',
    grantAccessTo('hacker'),
    simpleValidator('json', updateTeamSchema),
    async ctx => {
      // A leader can update anything but ID
      const body = ctx.req.valid('json');
      const user = ctx.get('user')!;

      const currTeam = await selectTeamFromLeader.execute({ userId: user.id });
      if (currTeam.length < 1) {
        return ctx.text('User does not own any teams.', 403);
      }

      const updatedTeam = await db
        .update(teams)
        .set(body)
        .where(eq(teams.id, currTeam[0]!.id))
        .returning();

      if (updatedTeam.length < 1) {
        apiLogger.error(
          ctx,
          'PUT /team',
          `Error while updating team ${currTeam[0]!.id} owned by ${user.id}.`
        );
        return ctx.text('Failed to update team. Internal error.', 500);
      }

      return ctx.text('', 204);
    }
  )
  .get('/', grantAccessTo('hacker'), async ctx => {
    // Returns team information
    const user = ctx.get('user')!;
    const teamLink = await selectTeamLinkFromMember.execute({
      userId: user.id
    });

    if (teamLink.length == 0) {
      return ctx.text('You are not in a team', 404);
    }

    const team = await db
      .select()
      .from(teams)
      .where(eq(teams.id, teamLink[0]!.teamId));
    if (team.length == 0) {
      apiLogger.error(
        ctx,
        'GET /team',
        `User ${user.id} is linked to team ${teamLink[0]!.teamId}, which does not exist.`
      );
      return ctx.text(`Internal error.`, 500);
    }

    return ctx.json(team[0]!, 200);
  })
  .put(
    '/transfer',
    simpleValidator('json', userIdSchema),
    grantAccessTo('hacker'),
    async ctx => {
      const oldLeader = ctx.get('user')!;
      const { userId: newLeaderId } = ctx.req.valid('json');

      const leaderTeamLink = await selectTeamLinkFromMember.execute({
        userId: oldLeader.id
      });
      if (leaderTeamLink.length < 1 || !leaderTeamLink[0]!.isLeader) {
        return ctx.text('User does not lead any team.', 404);
      }

      const newLeaderTeamLink = await selectTeamLinkFromMember.execute({
        userId: newLeaderId
      });
      if (
        newLeaderTeamLink.length < 1 ||
        leaderTeamLink[0]!.teamId != newLeaderTeamLink[0]!.teamId
      ) {
        return ctx.text('The user is not in the team', 400);
      }

      await db
        .update(teamMembers)
        .set({ isLeader: not(teamMembers.isLeader) })
        .where(
          or(
            eq(teamMembers.userId, oldLeader.id),
            eq(teamMembers.userId, newLeaderId)
          )
        );

      return ctx.json({}, 204);
    }
  )
  .delete('/', grantAccessTo('hacker'), async ctx => {
    const user = ctx.get('user')!;

    const team = await selectTeamFromLeader.execute({ userId: user.id });
    if (team.length < 1) {
      return ctx.text('Only a leader can delete the team', 400);
    }

    const success = await db.transaction(async tx => {
      const deletedUsers = await tx
        .delete(teamMembers)
        .where(eq(teamMembers.teamId, team[0]!.id))
        .returning();
      if (deletedUsers.length < 1) {
        apiLogger.error(
          ctx,
          'DELETE /team',
          `Failed to delete user team links for team ${team[0]!.id} lead by ${user.id}.`
        );
        return false;
      }

      await tx.delete(teamInvites).where(eq(teamInvites.teamId, team[0]!.id));

      const deletedTeam = await tx
        .delete(teams)
        .where(eq(teams.id, team[0]!.id))
        .returning();

      if (deletedTeam.length < 1) {
        apiLogger.error(
          ctx,
          'DELETE /team',
          `Failed to delete team ${team[0]!.id} lead by ${user.id}.`
        );
        tx.rollback();
        return false;
      }

      return true;
    });

    if (!success) {
      return ctx.text('Internal error, failed to delete team.', 500);
    }

    return ctx.json({}, 204);
  })
  .get(
    '/search',
    simpleValidator(
      'query',
      z.object({
        name: z.string().optional(),
        email: z.string().optional()
      })
    ),
    grantAccessTo('hacker'),
    async ctx => {
      // Returns full name as well as whether they're in a team or not
      const { name, email } = ctx.req.valid('query');
      const user = ctx.get('user')!!;

      if (!name && !email) {
        return ctx.text('Must provide a name or email.', 400);
      }

      // Can only search by name OR email; update Obsidian to note this.
      // Name takes precedence.
      const searchRes = await db
        .select({
          id: users.id,
          name: users.name,
          inTeam:
            sql<boolean>`CASE WHEN ${teamMembers.teamId} IS NOT NULL THEN true ELSE false END`.as(
              'inTeam'
            )
        })
        .from(users)
        .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
        .where(
          and(
            !name
              ? ilike(users.email, email!) // either name or email is undefined, but not both
              : ilike(users.name, `${name}%`),
            eq(users.role, 'hacker'),
            not(eq(users.id, user.id))
          )
        );

      if (searchRes.length == 0) {
        return ctx.text('Cannot find user with the filter', 404);
      }

      return ctx.json(searchRes, 200);
    }
  )
  .post(
    '/invite',
    grantAccessTo('hacker'),
    simpleValidator('json', userIdSchema),
    async ctx => {
      // Leader can invite a user
      const { userId } = ctx.req.valid('json');

      const userInDb = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));
      if (userInDb.length < 1) {
        return ctx.text('User does not exist', 404);
      }

      const invitedUserTeam = await selectTeamLinkFromMember.execute({
        userId: userId
      });
      if (invitedUserTeam.length > 0) {
        return ctx.text('User with this ID is already in a team.', 409);
      }

      const currentUser = ctx.get('user')!;
      const currentTeam = await selectTeamFromLeader.execute({
        userId: currentUser.id
      });
      if (currentTeam.length < 1) {
        return ctx.text('Only a leader can invite users', 400);
      }

      const invId = currentTeam[0]!.id;

      const currUsers = await db
        .select()
        .from(teamMembers)
        .where(eq(teamMembers.teamId, invId));
      if (currUsers.length >= MAX_TEAM_SIZE) {
        return ctx.text('Team is already at max users.', 403);
      }

      if (currUsers.some(entry => userId == entry.userId)) {
        return ctx.text('User is already in this team', 409);
      }

      const currInvites = await db
        .select()
        .from(teamInvites)
        .where(
          and(eq(teamInvites.userId, userId), eq(teamInvites.teamId, invId))
        );
      if (currInvites.length > 0) {
        return ctx.text('User is already invited', 409);
      }

      const invite = await db
        .insert(teamInvites)
        .values({
          teamId: invId,
          userId: userId
        })
        .returning();

      if (invite.length < 1) {
        apiLogger.error(
          ctx,
          'POST /team/invite',
          `Failed to invite user ${userId} to team ${invId} lead by ${currentUser.id}.`
        );
        return ctx.text('Failed to invite user to team.', 500);
      }

      return ctx.text('', 204);
    }
  )
  .get('/invite/ws', grantAccessTo('hacker'), async ctx => {
    // Realtime invites
  })
  .post(
    '/acceptInvite',
    grantAccessTo('hacker'),
    simpleValidator('json', teamIdSchema),
    async ctx => {
      // Remove all invites, and accept invite
      const { teamId } = ctx.req.valid('json');

      const user = ctx.get('user')!;
      const existingTeam = await selectTeamLinkFromMember.execute({
        userId: user.id
      });
      if (existingTeam.length > 0) {
        return ctx.text('User is already in a team', 409);
      }

      const invite = await db
        .select()
        .from(teamInvites)
        .where(
          and(eq(teamInvites.teamId, teamId), eq(teamInvites.userId, user.id))
        );
      if (invite.length < 1) {
        // Also hits this case for "team ID does not exist" but hey, that's true.
        // The user was not invited to a nonexistent team!
        return ctx.text('Invite does not exist', 400);
      }
      // Doesn't really matter if they've been invited to this team multiple times so we don't check > 1.

      const currMembers = await db
        .select()
        .from(teamMembers)
        .where(eq(teamMembers.teamId, teamId));
      if (currMembers.length < 1) {
        // If this is the case, this team is in a horribly invalid state
        // with no members and thus missing a leader, so we simply
        // delete the team and return an error.
        // Log it just in case.
        apiLogger.error(
          ctx,
          'POST /team/acceptInvite',
          `There was a valid team ${teamId} with zero users.\nUser ${user.id} was invited & attempted to join.`
        );
        await db.delete(teamInvites).where(eq(teamInvites.teamId, teamId));
        await db.delete(teams).where(eq(teams.id, teamId));
        return ctx.text(
          'Internal server error: team was in an invalid state, it has been deleted.',
          500
        );
      } else if (currMembers.length >= MAX_TEAM_SIZE) {
        return ctx.text('The team is full', 400);
      }

      const success = await db.transaction(async tx => {
        const removedInvites = await tx
          .delete(teamInvites)
          .where(eq(teamInvites.userId, user.id))
          .returning();
        if (removedInvites.length < 1) {
          apiLogger.error(
            ctx,
            'POST /team/acceptInvite',
            `Failed to remove ${user.id}'s pending invites upon accepting invite to team ${teamId}.`
          );
          return false;
        }

        const addedTeam = await tx
          .insert(teamMembers)
          .values({
            teamId: teamId,
            userId: user.id,
            isLeader: false
          })
          .returning();

        if (addedTeam.length < 1) {
          apiLogger.error(
            ctx,
            'POST /team/acceptInvite',
            `Failed to add ${user.id} to team ${teamId}.`
          );
          return false;
        }

        return true;
      });

      if (!success) {
        return ctx.text('Internal server error, failed to accept invite.', 500);
      }

      if (currMembers.length == MAX_TEAM_SIZE - 1) {
        await db.delete(teamInvites).where(eq(teamInvites.teamId, teamId));
      }

      return ctx.json({}, 204);
    }
  )
  .post(
    '/removeInvite',
    grantAccessTo('hacker'),
    simpleValidator('json', teamIdSchema),
    async ctx => {
      // Declines an invite
      const { teamId } = await ctx.req.json();

      const user = ctx.get('user')!;

      const deletedInvite = await db
        .delete(teamInvites)
        .where(
          and(eq(teamInvites.userId, user.id), eq(teamInvites.teamId, teamId))
        )
        .returning();
      if (deletedInvite.length < 1) {
        // Is it worth first checking if the invite exists so we can deduce if this is a database issue or the invite doesn't exist?
        return ctx.text('Invite does not exist', 404);
      }

      return ctx.json({}, 204);
    }
  )
  .post(
    '/removeUser/:userId',
    grantAccessTo('hacker'),
    simpleValidator('param', userIdSchema),
    async ctx => {
      // Removes user from team
      const { userId: userIdToRemove } = ctx.req.param();
      const teamLeader = ctx.get('user')!;

      if (userIdToRemove == teamLeader.id) {
        return ctx.text('You cannot remove this user', 400);
      }

      const team = await selectTeamFromLeader.execute({
        userId: teamLeader.id
      });
      if (team.length < 1) {
        // Not 404, as that would imply the user (context of their request) does not exist.
        return ctx.text(
          'User does not lead any teams to remove someone from.',
          400
        );
      }

      const removedEntry = await db
        .delete(teamMembers)
        .where(
          and(
            eq(teamMembers.userId, userIdToRemove!),
            eq(teamMembers.teamId, team[0]!.id)
          )
        )
        .returning();
      if (removedEntry.length < 1) {
        // Is it worth first checking if the user is not in a team so we can deduce if this is a database issue or?
        return ctx.text('You cannot remove this user', 404);
      }

      return ctx.text('', 204);
    }
  )
  .post('/removeUser', grantAccessTo('hacker'), async ctx => {
    // Aka '/leave'; remove yourself.
    const user = ctx.get('user')!;

    const teamsLeading = await selectTeamFromLeader.execute({
      userId: user.id
    });
    if (teamsLeading.length > 0) {
      return ctx.text('You cannot leave the team', 400);
    }

    const team = await db
      .delete(teamMembers)
      .where(eq(teamMembers.userId, user.id))
      .returning();
    if (team.length < 1) {
      return ctx.text('You are not in a team', 400);
    }

    return ctx.json({}, 204);
  });

export default team;
