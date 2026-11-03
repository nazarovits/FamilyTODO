# FamilyTODO Backlog

## MVP

### Authentication

- [ ] Login screen
- [ ] Email + password authentication
- [ ] User session persistence
- [ ] Logout

---

### Home Screen

#### Common

- [ ] Display today's remaining tasks
- [ ] Display overdue task counter
- [ ] Display open challenge counter
- [ ] Open task list with corresponding filters when tapping widgets

#### Parent

- [ ] Display pending approval counter
- [ ] Open task list with pending approval filter when tapping widget

#### Child

- [ ] Display current points balance
- [ ] Display current streak

#### Behavior

- [ ] Show happy/funny illustration when no overdue tasks exist
- [ ] Highlight available challenge tasks

---

### Profile Screen

- [ ] Display avatar
- [ ] Change avatar
- [ ] Display current points
- [ ] Open points history

---

### Points

- [ ] Award points for task completion
- [ ] Display points history
- [ ] Parent can manually add points
- [ ] Parent can manually subtract points
- [ ] Parent can create reward transactions
- [ ] Reward transactions appear in points history

Examples:

- Chocolate (-10)
- Extra Game Time (-20)
- Movie Night (-50)

---

### Tasks

#### Task List

- [ ] Display all visible tasks
- [ ] Quick filter chips

Examples:

- Today
- Overdue
- Pending Approval
- Challenges

- [ ] Filter button

#### Filter Modal

Filter by:

- [ ] Assignee
- [ ] Author
- [ ] Status
- [ ] Overdue
- [ ] Today
- [ ] Upcoming

---

### Task Creation

#### Parent

- [ ] Create task
- [ ] Edit task
- [ ] Delete task
- [ ] Assign task to any member
- [ ] Create open challenge task

#### Child

- [ ] Create task
- [ ] Assign to self
- [ ] Assign to parent
- [ ] Cannot assign to other children

---

### Task Details

- [ ] Title
- [ ] Description
- [ ] Status
- [ ] Priority
- [ ] Reward points
- [ ] Estimate
- [ ] Assigned user
- [ ] Created by
- [ ] Due date
- [ ] Reminder date
- [ ] Approval required flag

#### Comments

- [ ] Add comment
- [ ] View comments

#### Activity

- [ ] View task activity timeline

---

### Task States

Supported states:

- [ ] Open
- [ ] In Progress
- [ ] Pending Approval
- [ ] Done
- [ ] Rejected

---

### Task Approval Workflow

- [ ] Complete task
- [ ] Request approval
- [ ] Approve task
- [ ] Reject task
- [ ] Generate history entries

Business rules:

- Approval required → points awarded after approval
- No approval required → points awarded immediately

---

### Task History

Track:

- [ ] Created
- [ ] Updated
- [ ] Assigned
- [ ] Reassigned
- [ ] Completed
- [ ] Approval requested
- [ ] Approved
- [ ] Rejected
- [ ] Points awarded

---

### Recurring Tasks

- [ ] Daily recurrence
- [ ] Weekly recurrence
- [ ] Monthly recurrence

Business rule:

- [ ] Every occurrence stored separately
- [ ] Missed occurrences remain overdue

---

### Open Challenges

- [ ] Create challenge task
- [ ] No initial assignee
- [ ] Highlight on home screen

Business rule:

- [ ] First claim wins
- [ ] Parent may reassign
- [ ] Child may release challenge

---

### Routines

- [ ] Create routine
- [ ] Edit routine
- [ ] Delete routine
- [ ] Pause routine
- [ ] Activate routine

Example:

Morning Routine

- Brush teeth
- Make bed
- Pack school bag

---

### Activity Screen

- [ ] Display recent family activity

Examples:

- Emma completed Feed Cat
- Ben completed Homework
- Mom approved Clean Room
- Dad awarded 10 bonus points

---

## Future Versions

### Categories

- [ ] Household
- [ ] School
- [ ] Pets
- [ ] Family
- [ ] Personal

---

### Rewards Catalog

- [ ] Reward templates
- [ ] Reward redemption workflow
- [ ] Reward approval

---

### Achievements

- [ ] Badges
- [ ] Milestones
- [ ] Family achievements

---

### User Management

- [ ] Members screen
- [ ] Invite family member
- [ ] Remove member
- [ ] Group management

---

### Authentication Enhancements

- [ ] Google Sign-In
- [ ] Microsoft Sign-In

---

### Mobile Apps

- [ ] React Native application
- [ ] Android release
- [ ] iOS release
