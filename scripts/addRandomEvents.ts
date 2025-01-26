import { db } from '~~/server/src/drizzle';
import { events } from '~~/server/src/event/schema';
import type { Event } from '~~/shared/types';

function addRandomEvents(): Event[] {
  const events: Event[] = [];
  for (let i = 0; i < 10; i++) {
    let date = new Date(
      2025,
      2,
      Math.floor(Math.random() * 2) + 1, // Random day between 1 and 2
      Math.floor(Math.random() * 24),
      Math.floor(Math.random() * 60)
    );
    type Location = Event['locations'][number];

    events.push({
      id: i,
      title: `Event ${i}`,
      description: `Description for event ${i}`,
      startsAt: date,
      endsAt: new Date(date.getTime() + Math.floor(Math.random() * 3600000)), // Random time between 0 and 1 hour
      locations: Array.from(
        { length: Math.floor(Math.random() * 6) + 1 },
        (): Location => {
          const locations: Location[] = [
            'HXLY',
            'JCR',
            'SCR',
            'QTR',
            'QLWN',
            'HBAR',
            'ICME',
            'GRHL',
            'SF',
            'HF',
            'H308',
            'H311',
            'H340',
            'CLR'
          ];
          return locations[Math.floor(Math.random() * locations.length)]!;
        }
      ),
      public: true
    });
  }
  return events;
}

const eventsToAdd = addRandomEvents();
await db.insert(events).values(eventsToAdd);
