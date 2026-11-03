# Vertical Feature Development Process

This project follows a vertical-slice delivery model instead of a layer-by-layer approach.

A feature is considered complete only when it works end-to-end across the full stack:

- UI
- API
- Database schema / migrations
- Business logic
- Validation and error handling
- Tests
- Documentation / acceptance criteria

## Core Principle

Each iteration should deliver one user-facing capability that is meaningful on its own.

Examples:

- Login flow
- Forgot password flow
- Home dashboard
- Task list and details
- Task creation and approval
- Points and rewards
- Routines

This keeps the product shippable and reduces risk compared with building backend models or screens in isolation.

---

## Definition of a Vertical Slice

For every feature slice, we should include all of the following:

### 1. User Experience

- Screen(s) for the flow
- Validation and feedback states
- Empty/loading/error states
- Success path and failure path

### 2. API Layer

- Route(s) for the feature
- Request validation
- Response schema
- Auth/session handling where needed

### 3. Database

- Tables or schema changes
- Indexes when required
- Seed or migration scripts

### 4. Business Logic

- Rules for parent/child behavior
- Approval handling
- Reward calculation
- Security and authorization checks

### 5. Quality Bar

- Unit tests for business logic
- Integration tests for API flows
- Basic UI tests for critical path

---

## Iteration Model

We will work in small iterations, each delivering a single complete feature.

Each iteration should answer:

- What user problem does this solve?
- What screens and actions are included?
- What backend endpoints are required?
- What data model changes are required?
- What tests prove the slice works?

---

## Suggested Delivery Sequence

### Iteration 1: Login Flow

Goal: allow an existing user to sign in with email + password.

Included:

- Login screen UI
- Email + password form
- Client-side validation
- API login endpoint
- Session or JWT creation
- User database model
- Password hashing
- Auth middleware basics
- Basic login tests

Acceptance criteria:

- User enters valid email and password
- System authenticates and creates a session/token
- Invalid credentials return a friendly error
- Session persists for the authenticated flow

---

### Iteration 2: Forgot Password Flow

Goal: allow a user to reset a forgotten password.

Included:

- Forgot password link on login page
- Request reset screen
- Email submission and validation
- Reset token generation
- Reset password screen
- API to request token
- API to validate token and update password
- Email sending integration
- Password reset token table / records
- Expiration and invalid-token handling
- Tests for success and failure paths

Acceptance criteria:

- User requests password reset with a valid email
- A secure token is generated and sent
- User can submit the token and a new password
- Password is changed only when the token is valid and unexpired

---

### Iteration 3: Home Screen

Goal: provide a personalized landing page for parents and children.

Included:

- Today tasks summary
- Overdue task count
- Open challenge count
- Pending approvals for parents
- Current points / streak for children
- Navigation to task lists and details
- Empty states and illustrations

Acceptance criteria:

- User sees the relevant blocks based on role
- Widgets open filtered task views
- Data reflects current tasks and points

---

### Iteration 4: Tasks Core

Goal: allow users to create, view, filter, and manage tasks.

Included:

- Task list screen
- Task details screen
- Create/edit task form
- Status handling
- Filters and sorting
- Task comments / activity
- Task assignment and due dates

Acceptance criteria:

- Parent can create and assign tasks
- Child can complete tasks or request approval
- Task status changes are represented correctly

---

### Iteration 5: Task Approval and Points

Goal: close the completion cycle.

Included:

- Request approval flow
- Parent approval or rejection
- Points calculation and award rules
- Points history
- Reward transactions
- Activity feed entries

Acceptance criteria:

- Approved tasks award points
- Rejected tasks return to an actionable state
- Points history is visible and correct

---

### Iteration 6: Routines

Goal: support recurring responsibilities.

Included:

- Routine creation and editing
- Daily/weekly/monthly recurrence
- Pause and reactivation actions
- Routine examples like morning routine
- Generated tasks from routines

Acceptance criteria:

- Recurring tasks generate valid future occurrences
- Missed occurrences remain visible as overdue

---

### Iteration 7: Open Challenges and Family Management

Goal: support challenge tasks and role-based family coordination.

Included:

- Challenge creation
- Unassigned challenge tasks
- Claiming logic
- Reassignment rules
- Child release behavior
- Family member profiles and permissions

---

### Iteration 8: Profile and Activity

Goal: improve accountability and family transparency.

Included:

- Profile screen
- Avatar and user information
- Points history
- Activity timeline
- Family visibility and notifications

---

## Definition of Done for an Iteration

A completed vertical slice should have:

- a working user flow from start to finish
- an implemented UI
- backend API support
- database migration or schema change
- working business rules and validation
- tests covering the happy path and at least key failure paths
- documentation of the accepted behavior

---

## Recommended Working Style

- One feature slice at a time
- Use a dedicated branch or task per slice
- Keep acceptance criteria explicit
- Merge only after end-to-end validation
- Prefer small, testable deliverables over broad platform work

---

## Strategic Note

The most important idea is not to build “frontend first” or “backend first.”

The right approach is to build one real user workflow at a time, and ensure each workflow is complete across the application stack.
