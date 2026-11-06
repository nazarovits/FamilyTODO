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

Deploy `apps/web` as a separate Vercel project. Set the
`VITE_API_BASE_URL` environment variable to the API deployment origin, for
example `https://api.example.com` (origin only, without a path). Leave it
unset for local development to use the Vite `/api` proxy.

Set the API project's `WEB_APP_URL` to the exact web origin, for example
`https://app.example.com`; the API uses it to allow credentialed CORS requests.
Because authentication uses an HttpOnly cookie with `SameSite=Lax`, use web and
API custom domains under the same site (such as `app.example.com` and
`api.example.com`) for browser session cookies.
