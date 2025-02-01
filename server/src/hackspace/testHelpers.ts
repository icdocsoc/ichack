import { testClient } from 'hono/testing';
import { createUserWithSession } from '../testHelpers';
import app from '../app';

const teamName = 'llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch';
let index = 1; /* yes I know there are better ways of doing this but
                  isn't it fun to have that word in the codebase */
const tc = testClient(app);
const teamRoute = tc.team;

export const createNewTeam: () => Promise<number> = async () => {
  const { sessionId } = await createUserWithSession('hacker', {
    name: `TheLegend${index + 26}`,
    email: `imsupposedtobeplayinggameofwarbutthisoneplayerkeepskickingmy@ss.${index}`,
    password: 'wham!'
  });

  const res = await teamRoute.$post(
    { json: { teamName: teamName.slice(0, index) } },
    { headers: { Cookie: `auth_session=${sessionId}` } }
  );

  if (!res.ok) {
    console.log(await res.text());
    throw 'Unable to create a team for hackspace module testing!';
  }

  index++;
  return (await res.json()).id;
};

export const reqAllPositive = (team_id: number) => {
  return {
    team_id,
    jcr: 10,
    qtr: 11,
    scr: 12
  };
};

export const reqSomeNegative = (team_id: number) => {
  return {
    team_id,
    jcr: 10,
    qtr: -11,
    scr: 0
  };
};
