import { db } from '~~/server/src/drizzle';
import { events } from '~~/server/src/event/schema';

await db.delete(events);
await db.insert(events).values([
  {
    title: 'Registration',
    description:
      'Meet us at the Imperial College Main Entrance with your sign-up and government ID!',
    startsAt: new Date('2025-02-01T09:00:00'),
    endsAt: new Date('2025-02-01T10:00:00'),
    locations: ['ICME'],
    public: true
  },
  {
    title: 'Opening Ceremony',
    description:
      'The kickoff of IC Hack 25! Meet our sponsors and learn about the different challenge categories.',
    startsAt: new Date('2025-02-01T10:00:00'),
    endsAt: new Date('2025-02-01T12:00:00'),
    locations: ['GRHL'],
    public: true
  },
  {
    title: 'Hacking Begins',
    description: 'Head into your hackspaces - let the hackathon begin!',
    startsAt: new Date('2025-02-01T12:00:00'),
    endsAt: null,
    locations: ['QTR', 'SCR', 'JCR'],
    public: true
  },
  {
    title: 'Lunch',
    description: 'Munch munch munch!',
    startsAt: new Date('2025-02-01T12:00:00'),
    endsAt: new Date('2025-02-01T13:30:00'),
    locations: ['QTR', 'SCR', 'JCR'],
    public: true
  },
  {
    title: 'Marshall Wace Workshop',
    description: 'Join us for a workshop with Marshall Wace!',
    startsAt: new Date('2025-02-01T13:30:00'),
    endsAt: new Date('2025-02-01T14:30:00'),
    locations: ['CLR'],
    public: true
  },
  {
    title: 'Optiver Workshop',
    description: 'Join Optiver for an engaging workshop!',
    startsAt: new Date('2025-02-01T14:30:00'),
    endsAt: new Date('2025-02-01T15:00:00'),
    locations: ['HXLY'],
    public: true
  },
  {
    title: 'Helsing AI Workshop',
    description: 'Dive into an exciting workshop with Helsing AI!',
    startsAt: new Date('2025-02-01T15:00:00'),
    endsAt: new Date('2025-02-01T15:30:00'),
    locations: ['HXLY'],
    public: true
  },
  {
    title: 'JetBrains Workshop',
    description: 'Learn with JetBrains in this workshop session!',
    startsAt: new Date('2025-02-01T17:00:00'),
    endsAt: new Date('2025-02-01T17:30:00'),
    locations: ['HXLY'],
    public: true
  },
  {
    title: 'Anthropic Workshop',
    description: 'Explore cutting-edge topics in AI with Anthropic!',
    startsAt: new Date('2025-02-01T17:30:00'),
    endsAt: new Date('2025-02-01T18:00:00'),
    locations: ['HXLY'],
    public: true
  },
  {
    title: 'InterSystems Workshop',
    description: 'Join InterSystems for an interesting workshop!',
    startsAt: new Date('2025-02-01T18:00:00'),
    endsAt: new Date('2025-02-01T18:30:00'),
    locations: ['HXLY'],
    public: true
  },
  {
    title: 'Bubble Tea with The Trade Desk',
    description:
      'Cool down with some refreshing bubble tea hosted by The Trade Desk!',
    startsAt: new Date('2025-02-01T15:30:00'),
    endsAt: new Date('2025-02-01T16:00:00'),
    locations: ['HXLY'],
    public: true
  },
  {
    title: 'Marshall Wace Workshop',
    description: 'Join us for a workshop with Marshall Wace!',
    startsAt: new Date('2025-02-01T16:00:00'),
    endsAt: new Date('2025-02-01T17:00:00'),
    locations: ['CLR'],
    public: true
  },
  {
    title: 'Dinner',
    description: 'Dinnertime!',
    startsAt: new Date('2025-02-01T19:00:00'),
    endsAt: new Date('2025-02-01T20:00:00'),
    locations: ['QTR', 'SCR', 'JCR'],
    public: true
  },
  {
    title: 'Marshall Wace Treasure Hunt',
    description:
      'Solve clues around the Imperial College campus to win points and prizes for your hackspace!',
    startsAt: new Date('2025-02-01T20:00:00'),
    endsAt: new Date('2025-02-01T20:30:00'),
    locations: ['SF'],
    public: true
  },
  {
    title: 'Sweet Treats',
    description:
      'Load up on some sugary delights ahead of the long night ahead!',
    startsAt: new Date('2025-02-01T21:30:00'),
    endsAt: new Date('2025-02-01T22:00:00'),
    locations: ['SF'],
    public: true
  },
  {
    title: 'Countdown',
    description:
      'Flex your mental muscles with this vintage hackspace challenge!',
    startsAt: new Date('2025-02-01T22:30:00'),
    endsAt: new Date('2025-02-01T23:00:00'),
    locations: ['QTR', 'SCR', 'JCR'],
    public: true
  },
  {
    title: 'Midnight Pizza with G-Research',
    description:
      'Enjoy some pizza with G-Research to fuel you through the night!',
    startsAt: new Date('2025-02-02T00:00:00'),
    endsAt: new Date('2025-02-02T01:00:00'),
    locations: ['QTR', 'SCR', 'JCR'],
    public: true
  },
  {
    title: 'Pizza Tower Challenge',
    description:
      'Compete against the other hackspaces to construct the tallest pizza box tower!',
    startsAt: new Date('2025-02-02T00:30:00'),
    endsAt: new Date('2025-02-02T01:00:00'),
    locations: ['QTR', 'SCR', 'JCR'],
    public: true
  },
  {
    title: 'Karaoke',
    description:
      'What better way to relieve some stress with some 2am singing?',
    startsAt: new Date('2025-02-02T02:00:00'),
    endsAt: new Date('2025-02-02T03:00:00'),
    locations: ['SF'],
    public: true
  },
  {
    title: 'Breakfast',
    description: 'Enjoy light breakfast with some chai and mango lassi.',
    startsAt: new Date('2025-02-02T07:30:00'),
    endsAt: new Date('2025-02-02T09:30:00'),
    locations: ['SF'],
    public: true
  },
  {
    title: 'Lunch',
    description: 'Lunchtime!',
    startsAt: new Date('2025-02-02T10:45:00'),
    endsAt: new Date('2025-02-02T11:30:00'),
    locations: ['QTR', 'SCR', 'JCR'],
    public: true
  },
  {
    title: 'Submission Deadline!',
    description: 'Time to submit the culmination of your hard work!',
    startsAt: new Date('2025-02-02T12:00:00'),
    endsAt: new Date('2025-02-02T12:00:00'),
    locations: ['QTR', 'SCR', 'JCR'],
    public: true
  },
  {
    title: 'Judging Begins',
    description: 'Present your hard work to our expert judges!',
    startsAt: new Date('2025-02-02T12:30:00'),
    endsAt: new Date('2025-02-02T14:30:00'),
    locations: ['QTR', 'SCR', 'JCR'],
    public: true
  },
  {
    title: "Finishers' Photo",
    description:
      "Join us at the Queen's Lawn for a big group photo for those who completed IC Hack 25!",
    startsAt: new Date('2025-02-02T14:30:00'),
    endsAt: new Date('2025-02-02T14:30:00'),
    locations: ['QLWN'],
    public: true
  },
  {
    title: 'Closing Ceremony',
    description:
      'Attend the closing ceremony for your prizes and a speech by a special guest!',
    startsAt: new Date('2025-02-02T15:00:00'),
    endsAt: new Date('2025-02-02T17:00:00'),
    locations: ['GRHL'],
    public: true
  }
]);
