import { AsyncResult, Result } from 'typescript-result';
import type {
  AnnouncementDetails,
  CreateAnnouncementDetails
} from '~~/shared/types';

type Response = { synced: boolean };

export default () => {
  const client = useHttpClient();

  const createAnnouncement = (
    details: CreateAnnouncementDetails
  ): Promise<Result<void, Error>> =>
    Result.try(async () => {
      const req = await client.announcement.$post({
        json: details
      });

      if (!req.ok) {
        throw new Error('Server error posting announcement!');
        return;
      }

      const response = (await req.json()) as Response;

      if (!response.synced) {
        throw new Error('Failed to sync with Discord!');
      }
    });

  const getAnnouncements = (): AsyncResult<AnnouncementDetails[], Error> =>
    Result.try(async () => {
      const req = await client.announcement.$get(undefined);
      if (!req.ok) {
        const errorMessage = await req.text();
        throw new Error(errorMessage);
      }
      const announcements = await req.json();
      return announcements.map((announcement: any) => ({
        ...announcement,
        pinUntil: announcement.pinUntil ? new Date(announcement.pinUntil) : null
      }));
    });

  const deleteAnnouncement = (id: number): Promise<Result<void, Error>> =>
    Result.try(async () => {
      const req = await client.announcement[':id'].$delete({
        param: { id: id.toString() }
      });
      if (!req.ok) {
        const errorMessage = await req.text();
        throw new Error(errorMessage);
      }
      const response = (await req.json()) as Response;

      if (!response.synced) {
        throw new Error('Failed to sync with Discord!');
      }
    });

  const editAnnouncement = (
    id: number,
    details: CreateAnnouncementDetails
  ): Promise<Result<void, Error>> =>
    Result.try(async () => {
      const req = await client.announcement[':id'].$put({
        param: { id: id.toString() },
        json: details
      });
      if (!req.ok) {
        const errorMessage = await req.text();
        throw new Error(errorMessage);
      }
      const response = (await req.json()) as Response;

      if (!response.synced) {
        throw new Error('Failed to sync with Discord!');
      }
    });

  const resyncAnnouncement = (id: number): Promise<Result<void, Error>> =>
    Result.try(async () => {
      console.log('Resyncing...');
      const req = await client.announcement.resync[':id'].$post({
        param: { id: id.toString() }
      });
      if (!req.ok) {
        const errorMessage = await req.text();
        throw new Error(errorMessage);
      }
      const response = (await req.json()) as Response;

      if (!response.synced) {
        throw new Error('Failed to sync with Discord!');
      }
    });

  return {
    createAnnouncement,
    deleteAnnouncement,
    getAnnouncements,
    editAnnouncement,
    resyncAnnouncement
  };
};
