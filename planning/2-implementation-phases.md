# 2. Implementation Phases

Ordering principle: prove the riskiest, most novel piece of this rebuild —
the **WYSIWYG PDF pipeline** (`0-project-desc.md`) — as early as possible,
on top of the smallest possible data model. AI features and the live
interview (both external-API-heavy, both already proven in v1) come later,
since they're additive and don't block each other. Deployment gets a thin
skeleton early (so CI/CD is exercised continuously, not bolted on at the
end) and hardens progressively.

Each phase lists **Goal**, **Scope**, and **Definition of Done (DoD)**.
Phases are meant to be shippable/demoable checkpoints, not sprints — merge
order within a phase is flexible.

---

## Phase 0 — Monorepo Bootstrap

**Goal:** a working, empty skeleton that builds, lints, and deploys nothing
yet, but proves the toolchain.

**Scope:**

- Confirm/adjust the existing Turborepo starter (`apps/client`, `apps/be`,
  `apps/admin`, `packages/*`) against the chosen stack in `1-tech-stack.md`.
- Wire env validation skeletons: Joi schema (BE), `@t3-oss/env-nextjs`
  schema (FE), with the build-vs-runtime split for `CLERK_SECRET_KEY`
  already in place even before Clerk is actually used.
- `packages/shared` types for `Resume`/`ApiResponse` (copy v1's shape as a
  starting point).

**DoD:** `pnpm dev` runs both apps locally; `pnpm lint`, `pnpm typecheck`,
`pnpm build` pass; env schemas fail loudly on a missing required var.

---

## Phase 1 — Auth & User Sync

**Goal:** a logged-in user exists in both Clerk and the local DB.

**Scope:**

- Supabase Postgres provisioned; Prisma schema for `User` only (include a
  `role` field, default `user`, now — cheap to add early, needed by
  `AdminGuard` in Phase 8); session pooler connection string wired per
  `1-tech-stack.md`.
- BE: `ClerkAuthGuard` (global, `@Public` bypass), Clerk webhook endpoint
  (`ClerkWebhookGuard`, Svix verify) syncing `user.created/updated/deleted`.
- FE: `@clerk/nextjs` sign-in/sign-up/OTP/SSO-callback routes; `HttpService`
  attaching `Authorization: Bearer <token>`.

**DoD:** sign up on FE → user row appears in Supabase; an authenticated
`GET` to a trivial protected BE route succeeds; an unauthenticated request
is rejected.

---

## Phase 2 — Resume Data Model + CRUD Editor (no PDF yet)

**Goal:** the section-based editor works end-to-end against real data,
rendered as plain HTML/Tailwind — deliberately _before_ pagination/export
exists, so the template markup is validated on its own first.

**Scope:**

- Prisma schema for `Resume` + section tables (personal, summary, skills,
  education, experience, projects, certifications, languages).
- BE: `ResumeService` CRUD (`GET/POST /resumes`), Redis (Upstash) caching +
  invalidation on mutation.
- FE: Redux `resume` + `template` slices (+ redux-persist), section-based
  form editor, `useSyncResume` + `Ctrl/Cmd+S` shortcut.
- Resume templates built as plain Tailwind/React components (the same
  components that will later feed the print pipeline) — at least 1
  template to start, not all 5.

**DoD:** create/edit/save a resume, reload the page, data persists; editor
form and preview pane both render from the same template component.

---

## Phase 3 — WYSIWYG PDF Pipeline (the core rebuild bet)

**Goal:** what Phase 2 renders on screen downloads as an identical, properly
paginated PDF. This is the phase that validates the whole architectural
decision in `0-project-desc.md` — treat it as a spike/de-risking phase, not
a routine feature.

**Scope:**

- Integrate **Paged.js** into the live preview so long content
  (e.g. a big experience list) visibly splits into A4 pages in-browser,
  respecting `break-inside: avoid` / orphans / widows.
- Backend PDF-export module: headless Chromium (Puppeteer or Playwright)
  navigating a dedicated print route, `page.pdf()` → buffer → download.
- Decide and stand up the Chromium runtime footprint now (system deps in
  the Dockerfile, or a separate export-service image) — don't defer this
  to the deployment phase, since it changes the image/build design.
- Test matrix on purpose-built edge-case resumes: single short resume
  (1 page), content that overflows exactly at a page boundary, a very long
  single item (e.g. one experience bullet list) that must not be split
  mid-item, and a multi-page resume with mixed section lengths.

**DoD:** for every case in the test matrix, the downloaded PDF's page
breaks and styling match the paginated preview; PDF text is selectable
(not rasterized); export works locally through a containerized Chromium,
not just the dev machine's local browser.

---

## Phase 4 — Templates, Fonts & Drag-and-Drop

**Goal:** the editor is actually usable/customizable, building on the
proven Phase 3 pipeline.

**Scope:**

- Remaining templates (target: parity with v1's 5) + font choices, all as
  Tailwind components — verify each new template against the Phase 3 test
  matrix, since pagination edge cases are template-shape-dependent.
- `@dnd-kit` reordering for sections and within-section items, operating
  directly on the real DOM template (this is the payoff of the Phase 3
  architecture choice).
- Template/format controls (spacing, color, date format, hidden sections,
  section order) driving the same `Format` object shape as v1.

**DoD:** user can reorder sections/items by drag, switch templates/fonts,
and still get a byte-for-byte-consistent PDF export reflecting those
choices.

---

## Phase 5 — AI Features (Parsing, Matching, Email Generation)

**Goal:** the three non-realtime Gemini-backed features, all funneled
through one `RagService` port (per v1's pattern) so the provider stays
swappable.

**Scope:**

- `RagService` + Gemini adapter, structured-JSON mode, per-feature schemas.
- Resume parsing: PDF upload → magic-byte validation → Gemini → auto-fill
  editor.
- Job-description matching: score + strengths + gaps.
- Email generation: from resume + JD + match result.
- Prompt-injection defense (sanitize user-supplied text before embedding
  in prompts) from day one, not retrofitted.
- Instrument every `RagService` call with token/cost logging (tagged by
  user + feature) — this is what feeds the Admin AI-usage dashboard in
  Phase 8; adding it now is far cheaper than backfilling it later.

**DoD:** each of the 3 features works against a real resume/JD end-to-end;
malformed/non-PDF uploads are rejected before hitting Gemini; every call
produces a usage/cost log record.

---

## Phase 6 — Real-Time Voice Mock Interview

**Goal:** the most complex feature, intentionally last since it's the most
isolated (its own WS gateway, its own audio pipeline) and least likely to
block anything else.

**Scope:**

- `InterviewGateway` (WebSocket, `WsAuthGuard` on handshake), Gemini Live
  Audio adapter (bidirectional streaming).
- FE: Web Audio capture (16kHz) + gapless playback, mic/AI analyser nodes,
  interview state machine (`idle → setup → connecting → active →
evaluating → result`).
- Post-interview evaluation/feedback scoring.

**DoD:** a full mock interview can be started, held, and ended with an
audible AI voice both ways, and a scored result is produced afterward.

---

## Phase 7 — Internationalization

**Goal:** UI fully localized, not bolted on per-feature.

**Scope:**

- next-intl wired with all 11 locales from the start of the app shell
  (Phase 0/1), but **completeness is enforced here**: every label added in
  Phases 1–6 gets audited against `en.json` across all 11 locale files,
  including dynamically-built keys (`labelKey`/template-literal patterns).
- RTL layout check for Arabic.

**DoD:** structural parity across all 11 locale JSON files; no hardcoded
user-facing string found in a sweep of all components built so far.

---

## Phase 8 — Admin Dashboard

**Goal:** a separate, staff-only app for operating the product, built once
there's enough real data/features (users, resumes, AI usage logs) for it
to have something to show.

**Scope:**

- Scaffold `apps/admin` (Next.js, TanStack Query, shared `packages/ui`) per
  `1-tech-stack.md`; wire Clerk auth reusing the same Clerk project as the
  client app.
- BE `AdminGuard` (role check on the `User.role` field from Phase 1) +
  admin-only read endpoints: user list/detail, resume list/detail.
- Analytics dashboard: resumes created, PDF exports, AI call volume, active
  users — sourced from existing tables plus the Phase 5 usage logs.
- AI cost/usage view: per-user/per-feature token and cost breakdown from
  the Phase 5 instrumentation.
- System/content config: template & font catalog management, feature
  flags (start minimal — a flags table + simple on/off UI is enough).

**DoD:** a `role: admin` user can log into `apps/admin` and see real
production-shaped data (users, resumes, AI usage/cost) that a non-admin
account cannot reach, either in the UI or by calling the admin API routes
directly.

---

## Phase 9 — Deployment Hardening

**Goal:** move from "runs on my machine" to the production topology in
`1-tech-stack.md`, applying its known gotchas up front instead of
rediscovering them.

**Scope:**

- `docker-compose.prod.yml`, `Dockerfile.fe`/`Dockerfile.be`/`Dockerfile.admin`
  (+ Chromium deps or separate export-service image from Phase 3), nginx +
  Certbot config (client on the main domain, admin on its own subdomain per
  `1-tech-stack.md`), GitHub Actions `ci.yml`/`deploy.yml` via Workload
  Identity Federation, the 3 env-blob GitHub secrets (BE/FE/Admin).
- Apply from day one: Supabase session-pooler connection string, FE
  `CLERK_SECRET_KEY` as a runtime compose var, FE healthcheck on
  `127.0.0.1`, all three `NEXT_PUBLIC_*` sync points (build-arg / workflow
  grep / env schema), Clerk production OAuth apps.
- Manual migration runbook for prod (deploy workflow does not run
  migrations).
- Logging: winston/nest-winston JSON + morgan → stdout → Docker
  `json-file` with rotation, per `1-tech-stack.md`.

**DoD:** a push to main deploys to the GCE VM via GitHub Actions; the app
is reachable over HTTPS; a login, a resume save, and a PDF export all work
against the production Supabase/Upstash instances; `admin.<domain>` is
reachable and rejects non-admin accounts.

---

## Phase 10 — Polish & Hardening

**Goal:** production-readiness pass across everything built so far.

**Scope:**

- Rate limiting tuned per-route (`@Throttle` overrides where the global
  10/60s default is wrong — e.g. PDF export, AI calls).
- `GlobalExceptionFilter` standardized error responses verified across all
  modules; internals masked in production.
- Security review pass (input validation boundaries, file upload
  restrictions, CORS/helmet config).
- Load-check the PDF export path specifically (Chromium concurrency limits
  under multiple simultaneous exports).

**DoD:** a `/security-review`-style pass finds no unresolved high/medium
findings; export path has a defined behavior (queue or reject) under
concurrent load rather than an undefined one.
