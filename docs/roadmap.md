# FamilyTODO Roadmap

## Development Strategy

The project follows a feature-based development approach.

Each feature must be delivered as a complete vertical slice including:

- UI
- API
- Database
- Business Logic
- Tests

A feature is considered complete only when the full flow is functional from end to end.

---

# Phase 1 - Project Foundation

Goal:

Create the technical foundation of the application.

## Tasks

### Repository Structure

- [ ] Setup pnpm workspaces
- [ ] Create apps/web
- [ ] Create apps/api
- [ ] Create packages/shared-types

### Frontend

- [ ] Setup React
- [ ] Setup TypeScript
- [ ] Setup Vite
- [ ] Setup TanStack Query
- [ ] Setup Routing

### Backend

- [ ] Setup Node.js application
- [ ] Setup REST API
- [ ] Setup database connection
- [ ] Environment configuration

### Database

- [ ] Setup PostgreSQL
- [ ] Migration strategy

### Deployment

- [ ] Configure Vercel
- [ ] Configure CI/CD pipeline

---

# Phase 2 - Authentication

Goal:

Allow users to securely access the application.

---

## Feature: Login

### UI

- [ ] Login screen
- [ ] Email field
- [ ] Password field
- [ ] Validation
- [ ] Error handling

### API

- [x] Login endpoint with password-hash verification
- [x] Database-backed session cookie
- [x] Session lookup and logout endpoints

Login uses Argon2id password hashes and opaque session tokens stored as hashes.
Accounts without a password set are rejected with the same invalid-credentials
response as other failed logins.

### Database

- [x] User and profile tables
- [x] Password hash storage
- [x] Session and password reset token tables

### Business Rules

- Email and password required
- Invalid credentials show friendly error message

### Tests

- [ ] Successful login
- [ ] Invalid password
- [ ] Unknown user
- [ ] Login without a set password
- [ ] Session persistence and expiry
- [ ] Logout revokes session

---

## Feature: Logout

### UI

- [ ] Logout action

### API

- [x] Logout endpoint

### Tests

- [ ] Session termination

---

## Feature: Password Recovery

### UI

- [ ] Forgot password screen
- [ ] Reset password screen

### API

- [ ] Request reset token
- [ ] Validate reset token
- [ ] Reset password

### Database

- [ ] Password reset token table

### Tests

- [ ] Token expiration
- [ ] Password reset success

---

# Phase 3 - Family Members

Goal:

Provide user profiles and family roles.

---

## Feature: User Profile

### UI

- [ ] Profile screen
- [ ] Avatar display
- [ ] User information display

### API

- [ ] Get current user
- [ ] Update profile

### Database

- [ ] User profile fields

---

## Feature: Roles

### Roles

- Parent
- Child

### Business Rules

Parent:

- Create task
- Edit task
- Assign task
- Approve task
- Manage routines
- Manage points

Child:

- View tasks
- Complete tasks
- Create tasks
- Comment on tasks

---

# Phase 4 - Task Management

Goal:

Provide the core task functionality.

---

## Feature: Create Task

### UI

- [ ] Create task screen
- [ ] Form validation

### API

- [ ] Create task endpoint

### Database

- [ ] Task table

### Business Rules

Parent:

- Can assign tasks to anyone

Child:

- Can assign task to self
- Can assign task to parent
- Cannot assign task to another child

---

## Feature: Task List

### UI

- [ ] Tasks screen
- [ ] Task cards
- [ ] Empty state

### API

- [ ] List tasks endpoint

---

## Feature: Task Filters

### UI

- [ ] Quick filter chips
- [ ] Filter modal

### Filters

- Today
- Overdue
- Pending Approval
- Challenges
- Assignee
- Author
- Status
- Upcoming

---

## Feature: Task Details

### UI

Display:

- Title
- Description
- Priority
- Status
- Points
- Estimate
- Assignee
- Author
- Due Date
- Reminder Date

### API

- [ ] Get task details

---

## Feature: Edit Task

### UI

- [ ] Edit task screen

### API

- [ ] Update task endpoint

---

# Phase 5 - Comments

Goal:

Allow communication around tasks.

---

## Feature: Task Comments

### UI

- [ ] Comment list
- [ ] Add comment form

### API

- [ ] Create comment
- [ ] List comments

### Database

- [ ] Task comments table

---

# Phase 6 - Approval Workflow

Goal:

Allow parents to verify completed tasks.

---

## Feature: Complete Task

### UI

- [ ] Complete action

### API

- [ ] Complete task endpoint

---

## Feature: Pending Approvals

### UI

- [ ] Pending approvals screen

### API

- [ ] List pending approvals

---

## Feature: Approve Task

### UI

- [ ] Approve action

### API

- [ ] Approve endpoint

### Business Rules

If approval is required:

- Points awarded after approval

---

## Feature: Reject Task

### UI

- [ ] Reject action

### API

- [ ] Reject endpoint

---

# Phase 7 - Task Activity

Goal:

Track all task changes.

---

## Feature: Task History

### Tracked Events

- Task created
- Task updated
- Task assigned
- Task completed
- Approval requested
- Task approved
- Task rejected
- Comment added

### UI

- [ ] Activity timeline

### Database

- [ ] Task history table

---

## Feature: Family Activity Feed

### UI

- [ ] Activity screen

### Examples

- Emma completed Homework
- Ben completed Feed Cat
- Mom approved Clean Room

---

# Phase 8 - Points & Rewards

Goal:

Introduce basic gamification.

---

## Feature: Points Awarding

### Business Rules

Approval Required:

- Points awarded after approval

No Approval Required:

- Points awarded immediately

---

## Feature: Points History

### UI

- [ ] Points screen
- [ ] Points ledger

### API

- [ ] List point transactions

### Database

- [ ] Point transactions table

---

## Feature: Bonus Points

### Parent Only

- [ ] Add bonus points

---

## Feature: Reward Transactions

### Parent Only

- [ ] Create reward transaction

Examples:

- Chocolate (-10)
- Game Time (-20)
- Movie Night (-50)

### Business Rule

Reward transactions appear in points history.

---

# Phase 9 - Open Challenges

Goal:

Provide unassigned tasks that anyone can claim.

---

## Feature: Challenge Tasks

### UI

- [ ] Highlight on Home screen
- [ ] Challenge indicator on Tasks screen

### API

- [ ] Claim challenge
- [ ] Release challenge

### Business Rules

- First claim wins
- Parent can reassign
- Child can release challenge

---

# Phase 10 - Home Dashboard

Goal:

Create the main user experience.

---

## Child Home

Widgets:

- Points
- Streak
- Overdue Tasks
- Open Challenges
- Today's Tasks

---

## Parent Home

Widgets:

- Points
- Pending Approvals
- Overdue Tasks
- Open Challenges
- Today's Tasks

---

## Widget Navigation

Overdue:

- Opens Tasks with Overdue filter

Pending Approval:

- Opens Tasks with Pending Approval filter

Challenges:

- Opens Tasks with Challenge filter

---

# Phase 11 - Routines

Goal:

Automate recurring responsibilities.

---

## Feature: Routines

### UI

- [ ] Routine list
- [ ] Routine details

### API

- [ ] Create routine
- [ ] Update routine
- [ ] Delete routine

---

## Feature: Routine Management

Actions:

- Create
- Edit
- Remove
- Pause
- Activate

---

## Feature: Recurring Tasks

Supported:

- Daily
- Weekly
- Monthly

Business Rule:

Each generated occurrence is tracked individually.

Missed occurrences remain overdue.
