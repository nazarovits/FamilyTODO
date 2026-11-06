# Monorepo Decision

The project will use a monorepo managed by pnpm workspaces.

No additional monorepo tooling (TurboRepo, Nx, Moonrepo, etc.) will be used for the MVP.

---

# Motivation

The primary goals of the project are:

- Keep the setup lightweight
- Minimize maintenance overhead
- Reduce complexity
- Focus on delivering the product rather than maintaining infrastructure
- Allow easy migration to another solution later if necessary

Since FamilyTODO is currently a solo-developer project, the additional features offered by more advanced monorepo tools are not required.

---

# Chosen Solution

Use:

- pnpm
- pnpm workspaces

Repository structure:

```text
FamilyTODO/

├── apps/
│   ├── web/
│   └── api/
│
├── packages/
│   └── shared-types/
│
├── docs/
│
├── pnpm-workspace.yaml
│
├── README.md
└── LICENSE
```

---

# Applications

## Web

Technology:

- React
- TypeScript
- Vite
- TanStack Query
- React Router

Location:

```text
apps/web
```

Deploy the web app as a Vercel project with `apps/web` as its root directory.

---

## API

Technology:

- Node.js
- TypeScript
- Express REST API

Location:

```text
apps/api
```

Run locally with `pnpm dev:api`. For Vercel, set the project root to
`apps/api`, enable **Include source files outside of the Root Directory in the
Build Step**, and run `pnpm run build`. The
`apps/api/api/[...path].ts` serverless function forwards API requests to the
compiled Express app. The API build script uses pnpm's workspace dependency
selector to build its workspace dependencies before compiling the API.

---

# Shared Packages

## shared-types

Purpose:

Store domain objects shared between frontend and backend.

Examples:

- UserRole
- TaskStatus
- TaskPriority
- DTO definitions

Location:

```text
packages/shared-types
```

---

# Local Development

Install dependencies from the repository root:

```sh
pnpm install
```

Run the web and API apps in separate terminals:

```sh
pnpm dev:web
pnpm dev:api
```

The web development server proxies `/api` requests to the local API on port
3001. The initial API health check is available at `/api/health`.
