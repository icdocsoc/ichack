---
created: 2024-07-04
authors:
 - Nishant
---
<details>
<summary>4th July 2024</summary>
Jay's been on a holiday for a bit and I had some free time, so I coded a bit of the server and when it got to a point where I was confident with the vision of the project, I decided to start writing down before everything else gets piled up. I should probably add testing and inline documentation for the server code since I *now* understand what I have written myself xD.
</details>
<details>
<summary>8th July 2024</summary>
Had a good meeting with Jay and the rest of the 24-25 committee regarding ICHack goals and plan of execution of the tech side. Created a schema of the main features we need to build a hackathon today, gonna ask for Jay's review when he's free. Documenting this a bit right now. That's it.
</details>
<details>
<summary>13th July 2024</summary>
1. Initialised websockets.
2. setup directory structure for a modular server build.
3. wrote and modified changed documentation.
4. rethought the new version (v2) of the system architecture.
</details>
<details>
<summary>16th July 2024</summary>
In the past couple days, we decided on the basic routes we wish to implement. See the Routes note. I have onboarded a long term volunteer, Harini Sritharar, to help us build the frontend (currently admin page). Today, I've implemented the create, login and logout routes in auth. I need to divert some attention into creating test utils for both Nuxt and server applications. 
<summary>18th July 2024</summary>
Yeah fuck the new version. For an app that only 700-800 users would use, We don't need to do that crap.  Also, fuck accessMap and urlTrieMap, it's complicated.. we can add a middleware for every route to restrict access.
</details>
<details>
<summary>22nd July 2024</summary>
No entries in the journal for a long time. In the course of the past 5 days, I changed multiple things regarding the setup of the server-side code. Now it feels like it has converged into something we can work with long-term. I am locking in the changes to the Basic auth routes. You can view the changes in the <a href="https://github.com/icdocsoc/ichack25/pull/4/files">PR #4 Diff</a>. Awaiting for Jay's review before I can continue otherwise I would realise more things I wouldn't like and change stuff again. So having something function on the main branch will then force me to conform to a pattern, even if later I realise it isn't the best. <br><br> Most of the changes were simply moving stuff around and renaming things. After typing out the documentation, it made sense to call something a particular way. Eg <tt>validateAccess</tt> should really be <tt>grantAccessTo</tt>, and that <tt>grantAccessTo('all')</tt> is basically rendering the middleware ineffective, but nice to be explicit.
</details>
