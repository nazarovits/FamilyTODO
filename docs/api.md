# API Reference

The API is an Express application in `apps/api`. Routes are mounted by
`apps/api/src/routes/api.ts` under `/api`. Shared request/response DTOs and
domain types live in [`../packages/shared-types/src/index.ts`](../packages/shared-types/src/index.ts).

## Endpoints

| Method and path | Authentication | Purpose |
|---|---|---|
| `GET /api/health` | None | Health check |
| `POST /api/login` | None | Create an authenticated session |
| `GET /api/session` | Optional | Return the current session, or `{ "user": null }` |
| `POST /api/logout` | Optional | Invalidate the current session |
| `POST /api/forgot-password` | None | Request a password-reset email |
| `POST /api/reset-password` | None | Set a password using a reset token |
| `GET /api/dashboard` | Authenticated | Dashboard placeholder; currently returns an empty task list |
| `GET /api/tasks/assignees` | Parent or child | Return assignees allowed for the current user |
| `POST /api/tasks` | Parent or child | Create a task |

## Task Creation

`GET /api/tasks/assignees` returns an envelope containing only profiled users
the current user may assign to:

```json
{
  "data": {
    "assignees": [
      {
        "id": "00000000-0000-4000-8000-000000000001",
        "displayName": "Parent",
        "role": "PARENT"
      }
    ]
  }
}
```

Parents can assign to any profiled user. Children can assign to themselves or
to a parent. The choices endpoint and task creation enforce the same assignment
policy.

`POST /api/tasks` accepts:

```json
{
  "title": "Feed the cat",
  "description": "Before dinner",
  "priority": "NORMAL",
  "rewardPoints": 0,
  "estimateMinutes": 10,
  "requiresApproval": false,
  "assigneeId": "00000000-0000-4000-8000-000000000001",
  "dueAt": "2026-11-16T18:00:00Z",
  "reminderAt": null
}
```

`title` is required, trimmed, and limited to 120 characters. `assigneeId` is a
required UUID. `priority` may be `LOW`, `NORMAL`, or `HIGH` and defaults to
`NORMAL`. `rewardPoints` defaults to `0` and must be a non-negative integer.
`estimateMinutes` is optional and must be a positive integer when provided.
`requiresApproval` defaults to `false`. Due and reminder dates are optional
ISO timestamps with a timezone offset. `description` is optional; a maximum
length remains to be decided in the feature plan.

The authenticated user is always the creator and the server sets the initial
status to `OPEN`. Client-supplied `createdById`, `status`, or other unknown
properties are rejected. The API resolves status and priority codes to their
database lookup rows and returns codes, not lookup IDs.

A successful request returns HTTP `201` with `{ "data": { "task": ... } }`.
The task DTO contains public task fields, status and priority codes, creator
ID, and the assignee's ID, display name, and role; it does not expose
`statusId` or `priorityId`.

| Condition | HTTP status | Error code |
|---|---:|---|
| No valid session | 401 | `UNAUTHENTICATED` |
| Authenticated user has no allowed role | 403 | `FORBIDDEN` |
| Invalid request fields | 400 | `INVALID_TASK_REQUEST` |
| Assignee UUID does not exist or is not assignable | 400 | `INVALID_TASK_ASSIGNEE` |

The current task handlers include defensive session/role checks while the
routes also apply authentication middleware. Task assignee eligibility is
currently enforced in the database service. [TD-003](./issues/technical-debt.md)
tracks consolidating these checks in middleware and aligning the forbidden
assignee response.

## API Structure

- `routes/` mounts endpoints and authentication/role middleware.
- `handlers/` validates requests and maps application results to HTTP
  responses.
- `schemas/` contains Zod request schemas.
- `services/database/` owns Prisma access and maps database rows to public DTOs.
- `services/tasks/` contains task policy shared by the API operations.
- `packages/shared-types` contains public domain types and DTOs used by both
  API and web.

Run the API checks from the repository root:

```sh
pnpm run build:api
pnpm --filter @familytodo/api test
```

The current tests cover task assignment rules, request validation, and
unauthenticated task routes. Broader API application and shared-package
coverage, including successful database persistence, is tracked by
[TD-004](./issues/technical-debt.md).
