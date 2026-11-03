# Screens

This document describes all MVP screens, their purpose, visible information, navigation, and supported actions.

---

# Navigation

## Child

Bottom navigation:

- Home
- Tasks
- Profile

---

## Parent

Bottom navigation:

- Home
- Tasks
- Activity
- Profile

Additional screens are accessible from actions and menus:

- Pending Approvals
- Routines
- Routine Details

---

# Login Screen

## Purpose

Authenticate users.

## Features

- Email input
- Password input
- Login button

## Future Enhancements

- Google Login
- Microsoft Login

---

# Home Screen

## Purpose

Provide a quick overview of current responsibilities and important actions.

---

## Common Widgets

### Overdue Tasks

Displays:

```text
⚠️ 3 overdue tasks
```

or

```text
😎 No overdue tasks
```

### Behavior

Tap:

```text
Open Tasks Screen
Filter = Overdue
```

---

### Open Challenges

Displays:

```text
🏆 2 available challenges
```

### Behavior

Tap:

```text
Open Tasks Screen
Filter = Challenges
```

---

### Today's Tasks

Displays:

```text
5 remaining tasks
```

Additional information:

- Task title
- Priority
- Due time (if available)

### Behavior

Tap task:

```text
Open Task Details
```

Tap widget:

```text
Open Tasks Screen
Filter = Today
```

---

## Child Home

Additional widgets:

### Points

Displays:

```text
120 points
```

Tap:

```text
Open Profile Screen
```

---

### Current Streak

Displays:

```text
🔥 7 day streak
```

---

## Parent Home

Additional widgets:

### Pending Approvals

Displays:

```text
✅ 4 tasks require approval
```

### Behavior

Tap:

```text
Open Tasks Screen
Filter = Pending Approval
```

---

# Tasks Screen

## Purpose

Display and manage tasks.

## Components

### Filter Chips

Quick access filters:

- Today
- Overdue
- Pending Approval
- Challenges

Selecting a chip applies the filter immediately.

---

### Task List

Displays:

- Title
- Priority
- Status
- Points
- Due Date
- Assignee

---

### Floating Action Button

Parent:

```text
Create Task
```

Child:

```text
Create Task
```

---

### Filter Button

Opens Filter Modal.

---

# Filter Modal

## Assignee

Options:

- All
- Me
- Family Members

---

## Author

Options:

- All
- Created By Me
- Created By Specific User

---

## Status

Options:

- Open
- In Progress
- Pending Approval
- Done
- Rejected

---

## Date Filters

Options:

- Overdue
- Today
- Upcoming

---

## Challenge Filter

Option:

- Open Challenges

---

# Create Task Screen

## Purpose

Create a new task.

---

## Fields

### Title

Required.

---

### Description

Optional.

---

### Priority

Options:

- High
- Medium
- Low

---

### Points

Reward for completion.

Example:

```text
20
```

---

### Estimate

Simple text field.

Examples:

```text
15 minutes

30 minutes

1 hour
```

---

### Due Date

Optional.

---

### Reminder Date

Optional.

---

### Approval Required

Boolean.

```text
Yes / No
```

---

### Assignment Type

Options:

```text
Assigned
Challenge
```

---

### Assigned User

If task is assigned.

---

## Child Restrictions

A child may assign the task to:

- self
- parent

A child may not assign a task to another child.

---

# Task Details Screen

## Purpose

View all information related to a task.

---

## Content

### General Information

- Title
- Description
- Status
- Priority
- Points
- Estimate
- Due Date
- Reminder Date
- Created By
- Assigned To

---

### Actions

Depending on role and state:

- Start Task
- Complete Task
- Claim Challenge
- Release Challenge
- Edit Task
- Delete Task
- Approve Task
- Reject Task

---

## Comments Section

Displays comments chronologically.

Parent and child may add comments.

Examples:

```text
Please don't forget the desk.

Homework finished.

Good job!
```

---

## Activity Timeline

Displays task history.

Examples:

```text
Task created

Assigned to Emma

Comment added

Marked complete

Approved
```

---

# Profile Screen

## Purpose

Display user information and points balance.

---

## Content

### User Information

- Avatar
- Name
- Role

---

### Current Points

Displays current balance.

Example:

```text
125 points
```

---

### Points History

Displays:

```text
+20 Clean Room
+10 Feed Cat
-15 Chocolate
+30 Homework
```

---

## Parent Actions

### Bonus Transaction

Add points manually.

Example:

```text
+20 Helped Grandma
```

---

### Reward Transaction

Subtract points manually.

Example:

```text
-20 Extra Game Time
```

Transactions are visible in the points history.

---

# Activity Screen

Parent Only

## Purpose

Display family activity feed.

---

## Content

Examples:

```text
Emma completed Homework

Ben completed Feed Cat

Mom approved Clean Room

Dad granted 10 bonus points
```

Entries are displayed in reverse chronological order.

---

# Pending Approvals Screen

Parent Only

## Purpose

Display all tasks waiting for approval.

---

## Content

- Task Title
- Assignee
- Completion Date

---

## Actions

- Approve
- Reject

Selecting an item opens Task Details.

---

# Routines Screen

Parent Only

## Purpose

Manage routines.

---

## Content

Display routine list.

Examples:

```text
Morning Routine

Evening Routine

Saturday Cleaning
```

---

## Actions

- Create Routine
- Edit Routine
- Delete Routine
- Pause Routine
- Activate Routine

---

# Routine Details Screen

Parent Only

## Purpose

Manage routine contents.

---

## Fields

### Name

Required.

---

### Description

Optional.

---

### Tasks

List of tasks belonging to the routine.

Example:

```text
Morning Routine

- Brush Teeth
- Make Bed
- Pack School Bag
```

---

## Actions

- Add Task
- Remove Task
- Reorder Tasks
- Pause Routine
- Activate Routine
