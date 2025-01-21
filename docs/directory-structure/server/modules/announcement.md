---
created: 2024-07-30
authors:
  - Nishant
---

The schema is quite simple. It is a table of announcements where each announcement has some information. The `pinUntil` field are those announcements which need to be scheduled at the top before the others **if and only if** the current datetime is before the datetime mentioned in `pinUntil`.
