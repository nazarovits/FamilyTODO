# Task Creation Feature

## Status

Planning — implementation has not started.

## Goal

Deliver one complete, authenticated workflow that lets a parent or child create
a task, saves it to PostgreSQL, and confirms the result in the web app.

This feature is intentionally named **Task Creation**, rather than **Tasks** or
**Task Management**. It is the first vertical slice for tasks; task lists,
details, editing, completion, approvals, and related workflows can follow as
separate slices.

## Plan References

- [MVP backlog: Task Creation](../backlog.md#task-creation)
- [MVP backlog: Task Details fields](../backlog.md#task-details)
- [Roadmap: Create Task](../roadmap.md#feature-create-task)
- [Database schema documentation](../db/schemas.md)
- [UI layout and styling rules](../ui/layout.md)
- [Vertical-slice process](../vertical-slices.md)

## Current Starting Point

- The Prisma schema has users and profiles, but no task model.
- The API has no task routes or task persistence logic.
- The web Tasks page is currently a placeholder.
- The current data model assumes one family installation and has no family or
  membership table. Assignment rules therefore apply to the users in this
  single-family installation; do not imply multi-family isolation.
- The API has no automated test suite yet. Add focused tests for the behavior
  introduced by this slice using the test setup chosen for the API.

## Scope

### Included

- Create and persist a standard assigned task.
- Persist the authenticated user as the task creator; never accept creator
  identity from the browser.
- Enforce parent/child assignment rules in the API.
- Provide the UI with only the valid assignee choices for the signed-in user.
- Validate the request on the client and server, show loading and error states,
  and show an explicit success state after creation.
- Add a database migration, API and UI tests, and update the task schema
  documentation.

### Not Included

- Task list, filters, task details, edit, or delete flows.
- Open challenges or unassigned tasks.
- Completing tasks, approval/rejection actions, or awarding points.
- Points history, comments, task activity, notifications, and recurring tasks.
- Family creation, invitations, or multi-family membership.

## Initial Task Data

The form and API should support the fields listed under Task Details in the
[MVP backlog](../backlog.md#task-details). Confirm the open field semantics
below before implementation.

| Field | Initial behavior |
|---|---|
| Title | Required and trimmed |
| Description | Optional |
| Status | Set by the server to `OPEN` on creation |
| Priority | Include in the form and persist; allowed values are a planning decision |
| Reward points | Include in the form and persist; validate as a non-negative integer |
| Estimate | Include in the form and persist; unit is a planning decision |
| Assignee | Required for this standard-task slice; selected from allowed users |
| Creator | Derived from the authenticated session |
| Due date | Optional |
| Reminder date | Optional |
| Approval required | Include in the form and persist; default is a planning decision |

Do not add fields for later features unless a documented requirement depends on
them.

## Business Rules

- A parent may assign a task to any user in the single-family installation,
  including themselves.
- A child may assign a task to themselves or to a parent.
- A child may not assign a task to another child.
- The API must enforce these rules even if the client submits a forged assignee
  ID.
- A standard task must have an assignee. Unassigned challenge tasks are out of
  scope.
- New tasks start in `OPEN` status. The client cannot choose an initial status.
- Creation records the authenticated user as creator.
- Saving a reward value does not award points; point transactions belong to a
  later slice.

## API Shape To Implement

- `GET /api/tasks/assignees` — authenticated; returns only the assignee choices
  allowed for the current user. This supports the parent/child rules in the
  creation form.
- `POST /api/tasks` — authenticated; validates and creates a task, derives the
  creator and initial status on the server, and returns the created task DTO.

Use the repository's existing response and error conventions. Add task DTOs to
`@familytodo/shared-types` if they are shared by the API and web app. Never
return Prisma records directly from the API.

## Acceptance Criteria

- A parent can create a task assigned to any available user.
- A child can create a task assigned to themselves or a parent.
- A child cannot create a task assigned to another child, including by
  bypassing the UI and calling the API directly.
- Unauthenticated requests are rejected.
- Invalid fields and invalid assignee IDs receive an explicit client-safe
  error and do not create a task.
- A valid task is persisted with the authenticated creator and `OPEN` status.
- The web form displays field validation, submission progress, API failures,
  and a clear success confirmation.
- The responsive UI follows the grid and spacing guidance and uses a colocated
  CSS Module, as specified in [layout.md](../ui/layout.md).
- Tests cover the role assignment rules, invalid input, unauthenticated
  requests, and successful persistence.

## Implementation Checklist

Keep this checklist current while implementing the feature. Check an item only
after its code and relevant verification are complete. If scope or behavior
changes, update this document before proceeding.

### 0. Confirm Product Rules

- [ ] Choose the priority values and their default.
- [ ] Choose the estimate unit and its allowed range.
- [ ] Choose the default for reward points.
- [ ] Choose the default for approval required.
- [ ] Set maximum title and description lengths.
- [ ] Define whether due and reminder inputs are dates or timestamps, including
  the timezone handling.
- [ ] Define whether a reminder may be later than the due date.

### 1. Database

- [ ] Add the task status and priority enums (after confirming their values).
- [ ] Add the Prisma Task model with creator and assignee relations to User.
- [ ] Add required-field, range, date, and foreign-key constraints as
  appropriate.
- [ ] Add indexes for the expected assignee/status/due-date access patterns.
- [ ] Create and review the Prisma migration against the configured development
  database; do not reset existing data to resolve migration history issues.
- [ ] Regenerate Prisma Client and update [schemas.md](../db/schemas.md).

### 2. API

- [ ] Define shared request/response DTOs and request validation.
- [ ] Implement authenticated assignee choices with role filtering.
- [ ] Implement authenticated `POST /api/tasks` and derive creator/status from
  trusted server state.
- [ ] Enforce assignee eligibility in the database/service boundary.
- [ ] Map database results to the public task DTO and follow existing API error
  conventions.
- [ ] Add focused API/service tests for success, validation, authorization,
  unauthenticated access, and persistence.

### 3. Web

- [ ] Add a create-task route or entry point from the Tasks screen.
- [ ] Load and display allowed assignees.
- [ ] Build an accessible task form for the confirmed fields.
- [ ] Add client-side validation consistent with server rules.
- [ ] Submit through the shared API client and handle loading, failure, and
  success states.
- [ ] Style the form with a colocated CSS Module and follow
  [layout.md](../ui/layout.md).
- [ ] Add UI coverage for the successful flow and important validation/error
  states.

### 4. Verify and Close the Slice

- [ ] Verify parent and child flows end to end against the development
  database.
- [ ] Verify prohibited child-to-child assignment is rejected by the API.
- [ ] Run API tests, web checks/build, and `git diff --check`.
- [ ] Review the migration and API response for accidental exposure of
  database-only fields.
- [ ] Update the roadmap/backlog checkboxes and mark this document complete
  only after all acceptance criteria pass.
