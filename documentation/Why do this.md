---
date: 2024-07-04
authors:
  - Nishant
---
In 2023-24, Nishant and Jay were Tech Volunteers and we built the IC Hack '24 from the ground up as long-term volunteers. The same pair were elected as Webmasters of DoCSoc in 2024-25. we believe we can build a tech system that's scalable and extendable for at least a couple years. That is possible with a well written code base and **well documented one too** (which we and the '25 volunteers will do our best in).

This is the first year where all the code will be in a single place with full documentation for new volunteers contributing to the code base as well as future committees taking inspiration.

## Why did we start so early?

- For IC Hack '24 and earlier, development of the website started late October until mid-January (actually first week of February). Historically, IC Hack has happened in the first weekend of February. 
- IC Hack '25 is being held in the first week of February which pushes not only Tech but every other team.
- We are building our own backend. Historically, all IC Hack builds used Firebase BaaS.

## Why build your own server?

- Degree of Freedom and Flexibility. 
- Implement cybersec rules and security is a way we want it to be.
- Firebase only provides Firestore (NoSQL Database). Data Connect is only in Early Access Program at the moment (highly unstable).
	- From IC Hack '24, it was pretty clear that our data fits SQL-like db better than NoSQL. 
- Firebase can be a pain in the ass. Doesn't mean building your server isn't. But it's own set of complications and issues.
- Because we can. 