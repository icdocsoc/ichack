# Routes

::: warning
Formatting required for this page. See the src markdown file for now.
:::

## Announcements (/annoucement)

GET /sse --> SSE to get all annoucements. "authenticated"
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
GET /all --> returns all users. "admin"
GET /:id --> returns the user of id. "volunteer"
GET /search?name={string}&email={string} --> returns list of users of query. name takes precedence "volunteer"
POST /cv --> Uploads a CV to storage bucket. "hacker, volunteers"
GET /cv --> Get the cv in pdf. "sponsor, hacker"
GET /subscribe --> websocket for profile details. "authenticated"
PUT / --> Updates the profile info with a partial user object. "authenticated"
PUT /meal --> {userId: string} sets the current meal to true. "volunteer"
GET /discord?code={string}&state={string} --> redirects to discord oauth, or adds user to server based on whether code and state provided.
GET /register?token={string} --> get the name, email, and role from a registeration token
POST /register?token={string} --> register user using token `token`

## Team (/team)

POST / --> create a team in the db, named `firstName`s team. "hacker"
PUT / --> a leader can update anything (not id) on the team db. "hacker"
DELETE / --> a leader can delete the team. "hacker"
PUT /transfer --> {userId: string} a leader can transfer ownership of a team. "hacker"
GET /search?name={string}&email={string} --> returns user full name, id, and whether they are in a team or not. "hacker". searches by name OR email, name takes precedence.
GET / --> get the team information. "hacker"
GET /ws --> websocket subscribe for team info. "hacker"
POST /invite --> {userId: string} a leader can invite a user. "hacker"
GET /invite/ws --> A hacker can see realtime invites. "hacker"
POST /acceptInvite --> {teamId: string} removes all invites of the hacker and adds hacker's uid to user_team table. "hacker"
POST /removeInvite --> {teamId: string} removes that entry from team_invites table. "hacker"
POST /removeUser/:userId --> Leader can remove a user from a team. "hacker"
POST /removeUser --> authenticated hacker can remove themselves from the team. "hacker"
GET /admin/searchTeam --> Returns a list of team names with a partial match to the team name input. "admin"
GET /admin/searchTeam/byPerson --> Returns a list of teams along with the associated members' names and status, based on a partial match to the person's name input. "admin"
GET /admin/getTeamData --> Returns all data for a team, including members and invites, based on the team ID. "admin"

## QR (/qr)

POST / --> creates a entry in the db linking a user id to a qr code uuid "hacker"
GET /:uuid --> gets the profile of a user from a given uuid "volunteer, admin"
DELETE / --> deletes an entry from the db by uuid "god"
