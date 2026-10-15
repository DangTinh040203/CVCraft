# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

CraftCV is an AI-powered, ATS-optimized CV builder. It is a rebuild of an earlier `resume-builder-v1`, and the main change is a new WYSIWYG PDF pipeline. pnpm workspaces + Turborepo monorepo:

- `apps/client`: Next.js App Router user app (port 3001)
- `apps/admin`: Next.js admin dashboard (port 3002)
- `apps/backend`: NestJS 11 API (port 8000, global prefix `/api`)
- `packages/ui`: shared shadcn/ui-style components, `packages/shared`: types/utils shared by all apps, plus shared `eslint-config`, `prettier-config` and `typescript-config`

The project is early. Built so far: Clerk auth (SSO only), the Redux builder synced to the backend, Postgres/Prisma user + resume models, Puppeteer PDF export, the Paged.js paginated preview, and Gemini resume parsing (PDF import). Still **not built**: next-intl (the client is English-only for now), BullMQ jobs, and the other v1 AI features (job matching, email generation and mock interviews were deliberately left out). Read `planning/` before you build a feature:

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
- Each template takes `{ resume: ResumeData }` only. `ResumeDocument` (`resume-document.tsx`) renders a template by key and applies the Customize panel's font and accent color: the accent remaps the template's Tailwind palette variables (`accentPalette` in the registry), or `--resume-accent` for templates that use a hex constant. Templates must skip sections whose data is empty, which is how "hidden sections" work. Skills come in two shapes: a proficiency level (`value: "Expert"`, the sample data) or a group listing items (`label: "Frameworks", value: "React, Next.js"`, what CV import returns). Use `isSkillLevel`/`skillDetail`/`hasSkillGroups` (`resume.types.ts`) and `SkillGroups` so a template never drops the items, and render `ProjectExtras` under each project's details for its tagline, role, responsibilities, technologies and demo.
- `/builder?template=<slug>` is the section editor (`components/builder-screens/`). The editor keeps the v1 `Resume` shape (`types/resume.type.ts`), and `toResumeData()` in `utils/resume.utils.ts` maps it to `ResumeData` (array index becomes `order`, Quill HTML becomes plain text, hidden sections are emptied). Save (button or Ctrl+S) posts the resume plus `templateKey` and `format` to `POST /resumes/:id`.
- `/print` renders a bare `ResumeDocument` from `window.__CRAFTCV_PRINT__` and sets `data-print-ready`. It is excluded from the Clerk middleware so the backend's headless Chromium can open it.
- The same template component is meant to become the PDF source (one-component architecture, see `planning/3-pdf-mvp-reference.md`). So that pagination stays correct, keep templates print-safe: put `break-inside-avoid` on each job, education and project block, and size the page with one `@page` A4 rule. A sidebar template (a flex-row root whose columns have background colors) gets its colored columns repainted edge to edge on every page by `PagedResume` (`sidebarBackdrops`/`paintBackdrops`), since the template's vertical padding becomes the page margin; keep sidebar colors on the column elements themselves, as solid background colors.

### Client and admin apps

- Client routes use route groups: `(main-layout)` for the marketing pages, templates, builder and legal pages, and `(auth-layout)` for auth.
- The admin app is organized by feature: `app/(dashboard)/*` routes are thin and delegate to `features/<name>/`. Tables use `@tanstack/react-table` through `components/data-table`. Forms use react-hook-form + zod.

### Backend

`main.ts` sets the global prefix (`API_PREFIX`, default `api`) and a global `ValidationPipe({ whitelist, transform })`. CORS is restricted to `FRONTEND_ORIGIN`. `ConfigModule` is global and loads `.env.development`, then `.env`. Add new features as NestJS modules imported into `AppModule`, with the same layers (`presentation/{controllers,dtos}`, `application/{services,interfaces,...}`, `domain`, `infrastructure`) and an `index.ts` barrel per folder. Errors: throw Nest exceptions (wrap with `{ cause }`) and let `GlobalExceptionFilter` log them once (5xx with stack, 4xx as warn); don't log-and-rethrow. `CacheService` is best-effort (Redis down = cache miss). `GET /health` checks Postgres and Redis (503 when either is down). The global prefix is `${API_PREFIX}/v${API_VERSION}` (e.g. `/api/v1`), and Swagger is served at `/docs` outside production. `ClerkAuthGuard` is global, so mark open routes with `@Public()`.

- `user`: Clerk webhook (`POST /users/clerk`, svix-verified against the raw body) creates, updates and deletes users. `user.created` awaits (`emitAsync`) `resume`'s listener, which creates the user's default resume (one resume per user, as in v1, so there is no delete endpoint). Handlers are idempotent: a failure fails the webhook and Clerk's redelivery finishes the job. A signed-in user without a DB row gets a 404 ("account still being set up").
- `resume`: `GET /resumes` returns the current user's resume. `POST /resumes/:id` replaces the resume and all its child rows in one transaction, storing array order in `order`. `POST /resumes/parse` takes a PDF (`file`, max 5 MB, magic bytes checked), extracts its text with pdf-parse and has Gemini return it as resume JSON; nothing is saved, the client fills the editor (`useImportResume`).
- `llm`: `LlmService` is the LLM port (`LLM_PROVIDER_TOKEN`, Gemini adapter). It uses `GEMINI_MODEL` (default `gemini-3.5-flash-lite`, ~3 s per CV), retries 429/5xx briefly, and switches to `GEMINI_FALLBACK_MODEL` (default `gemini-3.1-flash-lite`) while the primary stays overloaded; requests time out after 30 s, and a thinking level the model rejects is dropped instead of failing. Prompts and response schemas live in each feature module.
- `pdf`: `POST /pdf/export` takes `{ templateKey, format, resume }`, opens the FE `/print` route in one long-lived Puppeteer browser (a new page per request), and returns the PDF. Request interception only allows the FE origin plus https images and fonts. `PDF_RENDER_URL` overrides the FE base URL.

### Turbo

`lint`, `typecheck`, `test` and `build` depend on `^build`, so the internal packages build first. Turbo passes `NODE_ENV`, `FRONTEND_ORIGIN` and `PORT` through as global env.
