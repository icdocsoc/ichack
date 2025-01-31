---
created: 2024-07-30
authors:
  - Nishant
  - George Decesare
---

The schema is quite simple. It is a table of announcements where each announcement has some information. The `pinUntil` field are those announcements which need to be scheduled at the top before the others **if and only if** the current datetime is before the datetime mentioned in `pinUntil`.

| Field    | Type       | Description        |
| -----    | ----       | ----------         |
| id       | `serial`   |  Primary key       |
| title    | `text`     | Announcent title   |
| location | `text`     | Location associated with announcement |
| description | `text`  | The main body of the announcement |
| created | `timestamp` | When the announcement was created; provided by server |
| pinUntil | `timestamp` | If `null` then not pinned; otherwise see above |
| messageId | `BigInt` | Snowflake referring to the Discord message of the announcement, needed for editing/deleting |

>[!Warning]
> The announcements require the `DISCORD_ANNOUNCEMENT_WEBHOOK` and `DISCORD_HACKER_ROLE_ID` environment variables to be set so that messages are properly posted to an announcement channel, with hackers pinged.