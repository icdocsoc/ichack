---
order: 5
---

# Post Mortems

This page is a retrospective of everything that went well and wrong with the project.

## IC Hack '25

Nishant had a vision of the website and it become true. Well, 90% true but it was a massive achievement by the entire tech team and additional contributors. The codebase has been built to last with well-thought out design choices, placement of code, directory structure, code hygiene etc. 

> The project was incomplete but it worked like fully-functioning well-oiled machine.

It was incomplete in the sense we were very time crunched that the last few commits leading upto the final deployment were shitty. But there were no tech problems at all. All raised issues during the event were human errors.
1. The Admin UI doesn't work on mobile, the Team's UI doesn't work on Mobile. The Dashboard had problems with components overflowing and not enough time to debug it. 
2. There was no live-updates from the server hence we had to use 5-10 second polling.
3. We noticed a small issue where the main app would run out of memory and crash itself every 4 hours. This is a suspected memory leak in the application. An update in [Bun v1.2.2](https://bun.sh/blog/bun-v1.2.2#javascript-uses-10-30-less-memory-at-idle) suggests that there were memory issues in previous versions. This is still untested, so the exact source of the memory leak is not yet found. However, this periodic crash didn't effect any user. The system booted back up within minutes. 
4. Some design choices were bad and some code hygiene started dropping a couple days before the event. There are plans to start refactoring them a few weeks before IC Hack'26 official development.

The Postgres instance was running normally however it may be a good idea to look into daily database backups upto the event and N-hourly backups during the event. We hope that future builds of the repository does not have to grind until the last moment. This repo, as it stands today, is built and designed to last 

Bun started to become a bit of a pain in the ass. It is promising with an extremely fast execution and build time with great in-built features. However, since it is still new and immature, random errors kept coming up; nothing too bad to stop development for a long time. There were some dependency issues with Nuxt and Bun; however that was simply Nishant's error, corrected in [PR#184](https://github.com/icdocsoc/ichack/pull/184)

A couple of ideas we missed we:
1. Make the profile scanning at registration increment a counter. There was no way of telling which user had entered our premises from the volunteer app. We had to use the `qr` table to check how many hackers are in the event - which is not accurate since hackers don't link their QR codes immediately.
2. QR codes should contain a link instead of plain-text UUID. This way, hackers don't have to visit the website to scan their wristband (they are welcome to if needed). The volunteer app can simply extract the UUID from the url with the in-website camera to make the requests.
3. A whitelist and blacklist tag for wristband UUIDs. This is not a big problem since we have a physical restraint on the scanning it (eg volunteers are instructed not to scan a qr code not on the person's wrist, or scan any picture, etc). It is never a bad idea to be extra safe.
4. On the technical side of things, a table for meals/event check-ins/etc should be present. This table is a read access to hackers and exclusive write/read access to gods/admin/volunteers. Semantically, it makes sense to segregate this from the `profiles` table which is write/read access by the hackers.
5. `POST /auth/create` is kind of a BS route. We never implemented this feature in the admin UI. A script to directly target the database is fine and less cumbersome.