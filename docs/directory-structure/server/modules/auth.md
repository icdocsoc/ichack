# Authentication

Here are the thoughts for the flow of major authentication events.

## Registration

1. Usually in IC Hack, the participants get their tickets on some third party website (like TicketTailor) and webmasters get a CSV file with all their detailed information. As webmasters, we take this information and create the users with a null password.
1. Webmasters will subsequently also create tokens of type 'registration_link' associated with one user and an expiry date. This token is attached to a magic link.
1. The user is presented with a registration screen where the user submits their password and profile details along with the token.
1. The user is now welcomed to see the internal systems.

**Note:** Subject to change when QR code requirements are given.

## Forgot password

1. In this event, the user can request us to change his password.
2. The backend verifies the account, creates a token of type "forgotten_password". An email is sent with a magic link with the token.
3. The user is redirect to a page to change their password. The password is changed with the token.
4. The password is updated. The user must log in again with the new password.

## Additional Information

1. The invariant should be that unregistered users should not get an auth cookie. The only place where an auth cookie is generated is in POST /login
