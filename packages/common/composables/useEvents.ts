import { Result } from 'typescript-result';
import type { Event as ICEvent } from '~~/shared/types';

export default function () {
  const client = useHttpClient();

  const getEvents = async (): Promise<Result<ICEvent[], Error>> => {
    return Result.try(async () => {
      const res = await client.event.$get();
      if (!res.ok) {
        const message = await res.text();
        throw new Error('Server errored when fetching events:' + message);
      }

      const eventsJson = await res.json();
      return eventsJson
        .map(event => {
          return {
            ...event,
            startsAt: new Date(event.startsAt),
            endsAt: event.endsAt ? new Date(event.endsAt) : undefined
          };
        })
        .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
    });
  };

  return {
    getEvents
  };
}
