# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

CraftCV is an AI-powered, ATS-optimized CV builder. It is a rebuild of an earlier `resume-builder-v1`, and the main change is a new WYSIWYG PDF pipeline. pnpm workspaces + Turborepo monorepo:

- `apps/client`: Next.js App Router user app (port 3001)
- `apps/admin`: Next.js admin dashboard (port 3002)
- `apps/backend`: NestJS 11 API (port 8000, global prefix `/api`)
- `packages/ui`: shared shadcn/ui-style components, `packages/shared`: types/utils shared by all apps, plus shared `eslint-config`, `prettier-config` and `typescript-config`

The project is early. Much of what `planning/` describes (Clerk auth, Redux, next-intl, Postgres/Prisma models, BullMQ jobs, Gemini AI, Paged.js/Puppeteer PDF export) is **not built yet**. The backend is still a bare `AppModule`. Read `planning/` before you build a feature:

- `0-project-desc.md`: product scope and core functions
- `1-tech-stack.md`: chosen libraries and conventions (e.g. FE env goes through `@t3-oss/env-nextjs` as `Env.X`, never raw `process.env`)
- `2-implementation-phases.md`: phase ordering and the Definition of Done for each phase
- `3-pdf-mvp-reference.md`: the proven PDF pipeline, including its gotchas
- `4-database-erd.md`: the planned data model

## Commands

Requirements: Node >= 20, pnpm >= 9. Copy each app's `.env.example` to `.env`.

```bash
pnpm install
pnpm dev:setup        # docker compose: Postgres 16, Redis 7, pgAdmin (docker/docker-compose.dev.yml)
pnpm dev              # client + backend + admin in parallel
pnpm dev:client | dev:admin | dev:backend
pnpm build            # or build:client / build:admin / build:backend
pnpm lint             # lint:fix to auto-fix
pnpm typecheck
pnpm format           # Prettier across the repo
pnpm test             # only the backend has tests (Jest, *.spec.ts under apps/backend/src)
```

Run one workspace with `pnpm --filter @repo/<client|admin|backend|ui|shared> <script>`. Run a single backend test with:

```bash
pnpm --filter @repo/backend test -- app.controller   # pattern matched against *.spec.ts files
```

## Conventions enforced by lint

- **No relative imports.** ESLint blocks `./` and `../`. Use `@/*` inside an app (it maps to the app root, or to `src/` in the backend) and `@repo/*` across packages. This applies to the backend's own files too, e.g. `import { AppModule } from '@/app.module'`.
- **Import boundaries:** client and admin must not import from each other or from the backend (and the reverse). Packages must never import from `apps/`. Shared code goes in `packages/shared`.
- Imports are sorted by `eslint-plugin-simple-import-sort`. Use inline `type` imports (`import { type X }`).
- Prettier: single quotes (JSX too), semicolons, trailing commas, 80 cols.
- `@repo/ui` uses subpath exports and has no barrel: `@repo/ui/components/button`, `@repo/ui/lib/*`, `@repo/ui/hooks/*`, `@repo/ui/globals.css`. `@repo/shared` exports from `src/index.ts`.

## Architecture notes

### Resume templates (`apps/client/components/templates/`)

- Each `template-NN.tsx` is a pure React component, `({ resume }: { resume: ResumeData }) => JSX`, styled with Tailwind. It renders at a fixed A4 width (`w-[210mm]`, which is 794×1123 px at 96dpi).
- `resume.types.ts` defines `ResumeData` and its helpers (`sortByOrder`, `formatDateRange`). `sample-resume.ts` is the demo data used for previews.
- `registry.ts` (`TEMPLATES`, `getTemplateBySlug`) is the single list of templates. It holds key, slug, name, description, `isPremium` and the component. Array order is display order. To add a template, create the component and register it here; the gallery, home preview and builder all read from the registry.
- `TemplateThumbnail` renders the **real** template at full size and CSS-scales it to fit its container. It is a live preview, not an image, so thumbnails never drift from the real template.
- `/builder?template=<slug>` is currently a placeholder that only previews the selected template. The section editor comes in Phase 2.
- The same template component is meant to become the PDF source (one-component architecture, see `planning/3-pdf-mvp-reference.md`). So that pagination stays correct, keep templates print-safe: put `break-inside-avoid` on each job, education and project block, and size the page with one `@page` A4 rule.

### Client and admin apps

- Client routes use route groups: `(main-layout)` for the marketing pages, templates, builder and legal pages, and `(auth-layout)` for auth.
- The admin app is organized by feature: `app/(dashboard)/*` routes are thin and delegate to `features/<name>/`. Tables use `@tanstack/react-table` through `components/data-table`. Forms use react-hook-form + zod.

### Backend

`main.ts` sets the global prefix (`API_PREFIX`, default `api`) and a global `ValidationPipe({ whitelist, transform })`. CORS is restricted to `FE_URL`. `ConfigModule` is global and loads `.env.development`, then `.env`. Add new features as NestJS modules imported into `AppModule`.

### Turbo

`lint`, `typecheck`, `test` and `build` depend on `^build`, so the internal packages build first. Turbo passes `NODE_ENV`, `FE_URL` and `PORT` through as global env.
