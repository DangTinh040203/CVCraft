# 1. Tech Stack (FE + BE + Deployment + Logging)

Baseline is v1's stack (see `resume-builder-v1/docs/`), kept as-is except
where noted. Two changes are already locked in from prior work on this
product: the **PDF pipeline** (see [`0-project-desc.md`](0-project-desc.md))
and the **data/deploy layer below** (Supabase + Upstash + GCE), which was
already designed and battle-tested in an earlier iteration — reused here
rather than re-decided.

---

## Frontend (`apps/client`)

| Concern         | Choice                                                                                              |
| --------------- | --------------------------------------------------------------------------------------------------- |
| Framework       | Next.js 16 (App Router), React 19                                                                   |
| State           | Redux Toolkit + react-redux + redux-persist                                                         |
| i18n            | next-intl (11 locales, RTL support)                                                                 |
| Styling         | Tailwind CSS 4                                                                                      |
| PDF pipeline    | Tailwind/HTML templates + Paged.js + Puppeteer/Playwright _(see 0-project-desc.md)_                 |
| Rich text       | quill / react-quill-new                                                                             |
| Drag & drop     | @dnd-kit (core + sortable + utilities)                                                              |
| Forms           | react-hook-form + @hookform/resolvers + zod                                                         |
| HTTP / realtime | axios, socket.io-client                                                                             |
| Auth            | @clerk/nextjs (Bearer JWT to BE, session-based on FE)                                               |
| Env validation  | `@t3-oss/env-nextjs` + zod — `configs/env.config.ts`, accessed as `Env.X` (never raw `process.env`) |
| UI kit          | shared `packages/ui` (Radix UI + Tailwind components)                                               |
| Testing         | vitest                                                                                              |

**Build-vs-runtime env split (carried over, non-obvious):** `NEXT_PUBLIC_*`
vars are inlined at `next build` time (passed as Docker build-args);
`CLERK_SECRET_KEY` is a runtime-only secret. The env schema uses
`skipValidation` at build time (`SKIP_ENV_VALIDATION=true` set only in the
Docker build stage) so the build doesn't fail on a secret that isn't
available yet — the runtime container gets the real secret and validates
fully on boot.

---

## Admin (`apps/admin`)

New third app, no v1 equivalent — internal-only staff tool for user/resume
management, analytics, and system/content config
(see `0-project-desc.md`, Core Function 10). Intentionally **not** a copy
of the client app's stack: it's read/CRUD/dashboard-heavy, not a complex
client-state editor, so it gets a lighter data layer.

| Concern        | Choice                                                                               |
| --------------- | ------------------------------------------------------------------------------------- |
| Framework       | Next.js (App Router), same major version as `apps/client`, separate app/port (dev: 3002) |
| Server state    | TanStack Query (`@tanstack/react-query`) — simpler fit than Redux for read-heavy tables/dashboards; no redux-persist needed |
| Tables          | `packages/ui` table components + `@tanstack/react-table` (sort/filter/pagination) |
| Charts          | `recharts` (already vendored in `packages/ui/src/components/chart.tsx`) for the analytics dashboard |
| Styling / UI    | Tailwind CSS 4 + shared `packages/ui` (same design system as the client app) |
| Auth            | `@clerk/nextjs` — **same Clerk identity/project as the client app**, not a separate user system |
| Access control  | Role-based: `publicMetadata.role === 'admin'` (or a Clerk Organization/role), checked both FE (redirect non-admins at layout level) and BE (`AdminGuard` on admin-only routes) |
| Env validation  | `@t3-oss/env-nextjs` + zod, same pattern as `apps/client` |

**Not included on purpose:** the PDF pipeline, `@dnd-kit`, and
`redux-persist` — none of the admin surface needs them, and pulling them in
would just be unused weight.

**BE support required for this app:**
- An `AdminGuard` (parallel to `ClerkAuthGuard`) that additionally checks
  the caller's role — reject non-admins with 403, not a silent empty
  response.
- Admin-facing read endpoints (user list/detail, resume list/detail,
  aggregate analytics) — either a dedicated `admin` module or
  admin-guarded routes layered onto the existing `user`/`resume` modules,
  decided when the module boundary is actually designed.

---

## Backend (`apps/backend`)

| Concern        | Choice                                                                                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework      | NestJS 11 (modular monolith, layered per module: presentation / application / domain / infrastructure)                                                      |
| ORM            | Prisma + `@prisma/adapter-pg` (`pg` driver adapter)                                                                                                         |
| Validation     | class-validator + class-transformer, global `ValidationPipe` (`whitelist`, `transform`)                                                                     |
| Env validation | Joi via `ConfigModule.forRoot({ validationSchema, isGlobal: true })` — `libs/configs/env.config.ts`, `Env` enum, read via `configService.getOrThrow(Env.X)` |
| Auth           | @clerk/backend + svix (webhook signature verify); `ClerkAuthGuard` (global), `ClerkWebhookGuard`, `WsAuthGuard` for sockets, `AdminGuard` (role check, for `apps/admin`) |
| AI/LLM         | `@google/genai` (Gemini) — structured-JSON mode for parsing/matching/email-gen, Live Audio for interviews                                                   |
| PDF export     | New module: headless Chromium via Puppeteer/Playwright, navigates a print-optimized route, returns PDF buffer                                               |
| Realtime       | @nestjs/websockets + platform-socket.io                                                                                                                     |
| Cache          | @nestjs/cache-manager + Keyv, pointed at Upstash Redis                                                                                                      |
| Rate limiting  | @nestjs/throttler                                                                                                                                           |
| Security       | helmet, CORS (`FRONTEND_ORIGIN`)                                                                                                                                  |
| Logging        | winston + nest-winston (app logs), morgan (HTTP access logs) — see Logging section                                                                          |
| API docs       | @nestjs/swagger (disabled in production)                                                                                                                    |

**Known gotcha to re-apply:** the shared ESLint rule
`@typescript-eslint/consistent-type-imports` (`fixStyle: inline-type-imports`)
auto-rewrites a DTO-only-used-as-a-type-annotation into a type-only import,
which erases it from `design:paramtypes` — `ValidationPipe` then silently
passes and `whitelist: true` strips every field. Fix: pass
`expectedType: TheDto` explicitly wherever a DTO is used as a pipe/decorator
parameter type (e.g. WS gateway handlers), not just in HTTP controllers.

---

## Data & Infra

| Concern  | Choice                                                              |
| -------- | ------------------------------------------------------------------- |
| Database | **Supabase Postgres** (managed, free tier)                          |
| Cache    | **Upstash Redis** (managed, serverless, free tier)                  |
| Auth     | **Clerk** (JWT for REST + WebSocket, Svix-signed `user.*` webhooks) |

**Supabase connection gotcha (already hit once, re-apply):** the direct host
`db.<ref>.supabase.co:5432` resolves **IPv6-only**; a GCE VM is IPv4-only by
default, so a direct `DATABASE_URL` times out on `$connect()` and crashes
the BE container. Use the **session-mode pooler** instead —
`aws-<region>.pooler.supabase.com:5432` with user `postgres.<ref>` — not the
6543 transaction-mode pooler, since Prisma's `pg` driver adapter doesn't
handle `?pgbouncer=true` (prepared-statement errors).

Both Supabase and Upstash are chosen specifically for their **free tiers**;
if usage outgrows them later, only the connection string/URL changes — no
application code depends on the hosting provider.

---

## Deployment / CI-CD

Reused as-is from the prior iteration's proven setup — the guiding
principle was **self-managed VM ops over a fully managed platform**
(the user wants hands-on control of logging/monitoring, not zero-ops).

| Concern       | Choice                                                                                                                                                                                                                                                                                                                                               |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Compute       | GCP Compute Engine **VM** running `docker compose` (not Cloud Run)                                                                                                                                                                                                                                                                                   |
| Registry      | Artifact Registry; VM pulls keyless via its attached service account                                                                                                                                                                                                                                                                                 |
| Reverse proxy | nginx + Certbot (Let's Encrypt)                                                                                                                                                                                                                                                                                                                      |
| CI/CD         | GitHub Actions; GCP auth via **Workload Identity Federation** (keyless, no JSON key); deploy step via `gcloud compute ssh` + OS Login                                                                                                                                                                                                                |
| Secrets       | 3 GitHub repo secrets as env-blobs: `BE_ENV_PRODUCTION` (written to `.env` on the VM, BE reads via `env_file`), `FE_ENV_PRODUCTION` (workflow greps `NEXT_PUBLIC_*` out of it as FE Docker build-args), and `ADMIN_ENV_PRODUCTION` (same pattern, kept separate from FE's so the two apps' env can diverge — e.g. a different `NEXT_PUBLIC_BASE_URL`/admin-only flags — without cross-editing). Updated with `gh secret set <NAME> < apps/{be,fe,admin}/.env.production`; local `.env.production` files are the source of truth and gitignored. |
| Migrations    | Run **manually** against prod (deploy workflow explicitly does not run migrations)                                                                                                                                                                                                                                                                   |

**Runtime pitfalls to design around from day one:**

- BE Dockerfile/CI needs Chromium's system dependencies for Puppeteer/
  Playwright (new for this rebuild — v1 didn't need a browser at runtime).
  Consider a separate, larger image/service for the PDF-export worker
  rather than bloating the main API image, and plan for its memory
  footprint (headless Chromium is not free) plus concurrency/queueing if
  export volume grows.
- Docker commands on the VM must run via `sudo` — the OS Login service
  account has sudo but isn't reliably in the `docker` group.
- FE container needs `CLERK_SECRET_KEY` set as a **runtime** env var
  (`environment:` in compose), separate from the `NEXT_PUBLIC_*` build-args
  — it's read by Clerk's Next.js middleware (`proxy.ts` in Next 16) on every
  request.
- FE healthcheck must hit `http://127.0.0.1:3001` explicitly — Next
  standalone binds IPv4-only, but `localhost` in an alpine image resolves
  `::1` first.
- Every `NEXT_PUBLIC_*` var the FE actually uses must exist in **three**
  places kept in sync: the Docker build-arg list, the CI workflow's `grep`
  extraction from the FE env-blob secret, and the `@t3-oss/env-nextjs`
  schema — otherwise it's `undefined` at build time with no error, only a
  silently broken feature.
- Clerk **production** instance needs its own OAuth apps (Google/GitHub),
  not the shared dev ones — set up in each provider's console and pasted
  into Clerk's dashboard, plus domain verification.
- `apps/admin` needs its own nginx server block (recommend a subdomain,
  e.g. `admin.<domain>`, over a path prefix — cleaner cookie/CORS scoping
  and easier to lock down separately). Since it's a staff-only surface,
  consider defense-in-depth beyond the Clerk role check alone — e.g. an
  nginx-level IP allowlist or basic auth in front of it — rather than
  relying solely on application-layer RBAC being bug-free.

---

## Logging & Monitoring

Given the "learn to run it, not just deploy it" stance behind the VM choice
above, logging stays self-hosted rather than routed to a third-party SaaS
by default:

- **App logs:** winston + nest-winston, structured **JSON**, written to
  stdout (never to a file inside the container).
- **HTTP access logs:** morgan (`combined` format in production, `dev`
  otherwise).
- **Collection:** rely on Docker's own `json-file` log driver, with
  `max-size` / `max-file` rotation set per service in
  `docker-compose.prod.yml` so logs can't fill the VM's disk. Inspect with
  `docker compose logs -f <service>`.
- **Optional next step (only if/when needed):** a lightweight self-hosted
  viewer (e.g. Dozzle) for a web UI over the same Docker logs with no extra
  infra, or a full self-hosted Grafana + Loki + Promtail stack on the same
  VM once querying/dashboards/alerting are actually needed. Not set up
  up-front — added only when the plain `docker compose logs` workflow
  stops being enough.

---

## Summary Table

| Layer          | Choice                                                         |
| -------------- | -------------------------------------------------------------- |
| Monorepo       | pnpm workspaces + Turborepo                                    |
| Frontend       | Next.js 16 / React 19 / Redux Toolkit / Tailwind 4 / next-intl |
| Admin          | Next.js / TanStack Query + Table / recharts / shared `packages/ui` |
| PDF pipeline   | Tailwind/HTML + Paged.js + Puppeteer/Playwright                |
| Backend        | NestJS 11 / Prisma / Socket.IO                                 |
| Database       | Supabase Postgres (session pooler)                             |
| Cache          | Upstash Redis                                                  |
| Auth           | Clerk (JWT + Svix webhooks)                                    |
| AI/LLM         | Google Gemini                                                  |
| Compute        | GCE VM + docker-compose                                        |
| Proxy/HTTPS    | nginx + Certbot                                                |
| CI/CD          | GitHub Actions + Workload Identity Federation                  |
| Env validation | Joi (BE), @t3-oss/env-nextjs + zod (FE)                        |
| Logging        | winston/nest-winston + morgan → stdout → Docker json-file      |
