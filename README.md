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

## Vercel Web Deployment

Deploy `apps/web` as a separate Vercel project. Its `vercel.json` rewrites
browser requests under `/api` to the API deployment, keeping API calls
same-origin from the browser. This lets the session cookie use `SameSite=Lax`
without a custom domain or third-party-cookie access. If the API deployment URL
changes, update the rewrite destination in `apps/web/vercel.json`.

Leave `VITE_API_BASE_URL` unset in the web project so the web app calls `/api`
on its own origin. Keep the web project's build command as `pnpm run build`;
the web build script builds its workspace dependencies before running
TypeScript and Vite.

Set the API project's `WEB_APP_URL` to the exact web origin, for example
`https://family-todo-1td1.vercel.app`; it is used for password-reset links and
the API's CORS allowlist. The browser accesses the API through the web
project's rewrite, so the two `*.vercel.app` domains do not need to share a
site.
