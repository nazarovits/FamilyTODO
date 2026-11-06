# FamilyTODO

A mobile-first family task management application.

Features:

- Parent and Child roles
- Task assignment
- Open challenge tasks
- Task approvals
- Points and rewards
- Routines
- Activity feed
- Recurring tasks

Tech Stack:

- React
- TypeScript
- TanStack Query
- Node.js
- PostgreSQL

Status:
Planning / MVP Specification

## Vercel API Deployment

For the API project, set the Vercel **Root Directory** to `apps/api`, the
**Framework Preset** to **Other**, and the **Build Command** to `pnpm run build`.
Enable **Include source files outside of the Root Directory in the Build Step**
so the pnpm workspace package can be built. Leave the Output Directory empty.
The `api/[...path].ts` function forwards API requests to the compiled Express
app. The API's `vercel.json` includes the `public` assets in its function
bundle so Express can serve the welcome page and favicon at runtime. The API
build script builds its declared workspace dependencies in dependency order,
so newly declared workspace dependencies are included automatically.
