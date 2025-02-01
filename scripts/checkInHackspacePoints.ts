import { eq } from 'drizzle-orm';
import { db } from '~~/server/src/drizzle';
import { eventCheckIn } from '~~/server/src/event/schema';
import { userHackspace } from '~~/server/src/hackspace/schema';

type Points = {
  [userId: string]: number;
};

const allCheckIns = await db.select().from(eventCheckIn);

const hackspacePoints: Points = {};

for (const checkIn of allCheckIns) {
  const { userId } = checkIn;

  hackspacePoints[userId] = (hackspacePoints[userId] || 0) + 5;
}

for (const user of Object.keys(hackspacePoints)) {
  await db
    .update(userHackspace)
    .set({
      points: hackspacePoints[user]
    })
    .where(eq(userHackspace.userId, user));
}
