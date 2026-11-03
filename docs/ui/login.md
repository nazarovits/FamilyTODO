# Login Screen

## Purpose

Allow an existing user to sign in with an email address and password.

## Layout

- Follow the shared responsive grid and spacing rules in [layout.md](./layout.md).
- Center a single-column form with a maximum width of approximately 400px.
- Do not show a “Welcome back” heading or message.
- Keep the form structure the same on mobile, tablet, and desktop.

## Content and Actions

1. FamilyTODO brand
2. Email field
3. Password field
4. Forgot password link beside or near the password label
5. Sign in button

## Responsive Behavior

- Below 768px, use the mobile layout with comfortable horizontal page padding.
- At 768px and above, center the same form within the page; do not expand it to
  fill the grid.

## States

- Idle form
- Field validation errors
- Invalid credentials feedback
- Submitting/loading state
- Successful sign-in navigation
