---
created: 2024-07-08
authors:
  - Nishant
---
## Announcements (/annoucement)

GET /all --> Websocket to get all annoucements. "authenticated"
POST / --> create an announcement. "admin"
PUT /:id --> edit the announcement. "admin" 
DELETE /:id --> delete an announcement. "admin"

## Auth routes (/auth)

POST /create --> Create a users and returns the object. "god"
POST /login --> Users can log in, return their session token. "all"
POST /logout --> Deletes the cookie on frontend. "authenticated"
DELETE /:id --> deleting a user. "god"
PUT /changePassword --> changes the password of a user. "authenticated"
POST /forgetPassword --> {email: string} send a forget password email. Check if email exists. "all"
POST /resetPassword --> {newPassword, token} completes the forgot password route. "all"

## Category (/category)

GET / -> get all categories. "authenticated".
GET /:slug -> get specific category (title). "authenticated".
POST / -> create the category. "admin".
PUT /:slug -> update all fields. "admin", "sponsor". Sponsors cannot change the title
DELETE /:slug -> deletes a category. "admin"

## Event (/event)

GET / --> Get all events. If not authenticated, send only public events. "public"
POST / --> Create an event. "admin"
PUT /:id --> Edit the event details. "admin"
DELETE /:id --> Delete an event. "admin"

## Profile routes (/profile)

GET / --> returns the logged in user. "authenticated"
GET /:id --> returns the user of id. "hacker, volunteer"
GET /search?name={string}&email={string} --> returns list of users of query. For email, has to be exact match. "hacker, volunteer"
POST /cv --> Uploads a CV to storage bucket. "hacker, volunteers"
GET /cv --> Get the cv in pdf. "sponsor, hacker"
GET /subscribe --> websocket for profile details. "authenticated"
PUT / --> Updates the profile info with a partial user object. "authenticated"
PUT /meal --> {userId: string, num: number} update the meal. "volunteer" 
<!-- Insert /discord route: TODO @Jay-->
<!-- Look into encryption for QR codes -->

## Team (/team)

POST / --> {name: string} create a team in the db. "hacker"
PUT /:id --> a leader can update anything (not id) on the team db. "hacker"
DELETE /:id --> a leader can delete the team. "hacker"
GET /user?id={string} --> returns the id of the team the user is in. "hacker"
GET / --> get the team information. "hacker"
GET /ws --> websocket subscribe for team info. "hacker"
POST /invite --> {userId: string} a leader can invite a user. "hacker"
GET /invite/ws --> A hacker can see realtime invites. "hacker"
POST /acceptInvite --> {teamId: string} removes all invites of the hacker and adds hacker's uid to user_team table. "hacker"
POST /removeInvite --> {teamId: string} removes that entry from team_invites table. "hacker"
POST /removeUser --> {userId: string} Leader can remove a user from a team. "hacker"
POST /leave --> authenticated hacker can remove themselves from the team. "hacker"