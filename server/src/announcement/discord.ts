import type { CreateAnnouncementDetails } from '~~/shared/types';
type Announcement = CreateAnnouncementDetails & { messageId: bigint };

const webhook = process.env.DISCORD_ANNOUNCEMENT_WEBHOOK;
const role = process.env.DISCORD_HACKER_ROLE_ID;
const announcementUsername = 'IC Hack Announcement';

const createDiscordMessage = (announcement: CreateAnnouncementDetails) => {
  return `# :loudspeaker: ${announcement.title}\n## Location: ${announcement.location}\n${announcement.description}\n-# <@&${role}>`;
};

const sendDiscordMessage = async (
  announcement: CreateAnnouncementDetails
): Promise<bigint | null> => {
  const message = createDiscordMessage(announcement);
  const response = await fetch(webhook + '?wait=true', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      content: message,
      username: announcementUsername
    })
  });
  if (!response.ok) {
    return null;
  }

  const messageResponse = await response.json();
  const messageId: bigint = messageResponse.id;
  return messageId;
};

const updateDiscordMessage = async (announcement: Announcement) => {
  const messageId: bigint = announcement.messageId;
  const message = createDiscordMessage(announcement);
  const response = await fetch(webhook + '/messages/' + messageId.toString(), {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      content: message,
      username: announcementUsername
    })
  });
  return response.ok;
};

const deleteDiscordMessage = async (messageId: bigint) => {
  const response = await fetch(webhook + '/messages/' + messageId.toString(), {
    method: 'DELETE'
  });
  return response.status == 204;
};

export { sendDiscordMessage, updateDiscordMessage, deleteDiscordMessage };
