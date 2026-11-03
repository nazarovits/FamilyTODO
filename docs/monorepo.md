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

Location:

```text
apps/web
```

---

## API

Technology:

- Node.js
- REST API

Location:

```text
apps/api
```

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
