# Profile Screen

## Layout

- Follow the shared responsive grid and spacing rules in [layout.md](./layout.md).
- Center content in a container capped at approximately 1200px.
- Show the profile identity and logout action together in the top profile card.
- On mobile, place the logout action below the avatar, name, email, and role.
- At 768px and wider, place the logout action to the right of the identity.
- Show the current points card and points history below the profile card. They
  stack on mobile and sit side by side on wider screens.
- Keep the bottom navigation visible while the user is on this page.

## Profile Identity

Display an avatar, display name, email address, and role. Until profile and
points APIs are connected, use representative UI data for fields that are not
available from the current authenticated-user context.

## Logout

Selecting **Log out** opens the shared `ConfirmDialog` with a confirmation
message and **No** / **Yes** actions. The close button and **No** action both
dismiss the dialog without logging out. **Yes** calls the existing logout API;
on success, clear the in-memory user and navigate to Login. If the request
fails, keep the dialog open and display an error.

## Confirm Dialog

- Use the native modal dialog behavior so focus is contained and restored.
- Accept a title and message, configurable action labels, busy/error state, and
  Yes/No callbacks.
- The close button and Escape key invoke the No callback.
- Disable dismissal while a confirmation action is in progress.