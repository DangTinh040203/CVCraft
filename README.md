# nest-next-monorepo-codebase

A monorepo starter for building full-stack apps with **NestJS** + **Next.js**, powered by **Turborepo** and **pnpm workspaces**.

## Tech stack

| Area          | Tech                                              |
| ------------- | ------------------------------------------------- |
| Monorepo      | Turborepo, pnpm workspaces                        |
| Frontend      | Next.js (App Router), React 19, Tailwind CSS v4   |
| UI            | shadcn/ui-style shared component library          |
| Backend       | NestJS 11, class-validator, @nestjs/config        |
| Language      | TypeScript (strict)                               |
| Lint / Format | ESLint 9 (flat config, shared), Prettier (shared) |

## Structure

```
apps/
  fe/                  # Next.js frontend (port 3001)
  be/                  # NestJS backend  (port 8000)
packages/
  ui/                  # Shared React UI components (shadcn/ui style)
  shared/              # Shared types & utils (FE + BE)
  eslint-config/       # Shared ESLint flat configs (base / next-js / react-internal / node)
  prettier-config/     # Shared Prettier config
  typescript-config/   # Shared tsconfig presets (base / nextjs / nestjs / react-library)
```

## Getting started

```bash
# Requirements: Node >= 20, pnpm >= 9
pnpm install

# Copy env files
cp apps/fe/.env.example apps/fe/.env
cp apps/be/.env.example apps/be/.env

# Run both apps in dev mode
pnpm dev

# Or individually
pnpm dev:fe   # http://localhost:3001
pnpm dev:be   # http://localhost:8000/api
```

## Scripts

| Command          | Description                         |
| ---------------- | ----------------------------------- |
| `pnpm dev`       | Run FE + BE in parallel (dev mode)  |
| `pnpm build`     | Build all apps & packages           |
| `pnpm lint`      | Lint all workspaces                 |
| `pnpm lint:fix`  | Lint & auto-fix                     |
| `pnpm typecheck` | Typecheck all workspaces            |
| `pnpm test`      | Run tests                           |
| `pnpm format`    | Format the whole repo with Prettier |

## Conventions

- **Path aliases only** — relative imports are blocked by ESLint; use `@/*` inside apps and `@repo/*` across packages.
- **Import boundaries** — FE must not import from BE (and vice versa); shared code lives in `packages/shared`.
- **Import sorting** — enforced via `eslint-plugin-simple-import-sort`.
- **Prettier** — single quotes, semicolons, trailing commas, 80 print width (see `packages/prettier-config`).
# resume-builder-rebuild
