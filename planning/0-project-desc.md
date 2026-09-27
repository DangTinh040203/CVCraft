# 0. Project Description

## Overview

**Resume Builder** is an AI-powered resume builder: a section-based editor with
live preview, PDF export, AI resume parsing, job-description matching, AI
email generation, and real-time voice mock interviews.

This is a **rebuild** of `resume-builder-v1` (same product scope, same
overall stack) with one deliberate architectural change on the frontend:
**the PDF rendering/export pipeline is replaced**. Everything else (backend
modules, AI integration pattern, auth model, i18n, data model) carries over
conceptually from v1 unless a planning doc says otherwise.

The rebuild also adds one thing v1 never had: a **separate admin app**
(`apps/admin`) — see Core Function 10 below.

Monorepo: pnpm workspaces + Turborepo — a Next.js (App Router) client app,
a separate Next.js admin app, and a NestJS backend, backed by
PostgreSQL + Redis, Google Gemini for AI features.

---

## Core Functions

1. **Resume Editor & Live Preview**
   Section-based form editor (personal info, summary, skills, education,
   experience, projects, certifications, languages). Multiple templates and
   fonts. Edits reflect in the preview pane instantly.

2. **WYSIWYG PDF Export** _(rebuilt — see below)_
   Downloadable PDF that is pixel-accurate to what the user sees in the
   editor, with correct pagination when content overflows a page.

3. **Resume Parsing (PDF → auto-fill)**
   User uploads an existing resume PDF; backend extracts structured resume
   data via Gemini and pre-fills the editor.

4. **Job-Description Matching**
   Compares a resume against a job description; returns a match score,
   strengths, and gap/improvement suggestions.

5. **AI-Generated Application Emails**
   Generates a tailored cover/application email from the resume, the job
   description, and the match result.

6. **Real-Time Voice Mock Interviews**
   WebSocket-based live interview session using Gemini Live Audio
   (bidirectional streaming), plus post-interview evaluation/feedback.

7. **Internationalization**
   Multi-locale UI (next-intl), including RTL locale support.

8. **Authentication**
   Clerk-based auth (JWT for REST + WebSocket, webhook sync to the local
   user table).

9. **Drag-and-Drop Editing** _(new/expanded scope for the rebuild)_
   Reordering resume sections and items directly in the editor. This is a
   first-class requirement for the rebuild and is a key reason for the PDF
   pipeline change below — it needs to operate on real DOM elements, not a
   PDF-renderer's virtual layout tree.

10. **Admin Dashboard** _(new — no equivalent in v1)_
    A separate, internal-only app (`apps/admin`) for operating the product:
    - **User & resume management** — look up users, view/moderate their
      resumes, handle reports/violations.
    - **Analytics** — usage numbers: resumes created, PDF exports, AI call
      volume, active users, etc.
    - **System/content config** — manage the template/font catalog, feature
      flags, and plan/pricing config if introduced later.
    - **AI cost/usage monitoring** — track Gemini token usage and cost,
      broken down per user/feature, to catch runaway usage early.

    Access is restricted to admin/staff accounts via role-based auth on top
    of the same Clerk identity used by the client app (not a separate user
    system). See `1-tech-stack.md` and `2-implementation-phases.md` for the
    stack and delivery plan.

---

## Key Architectural Change: PDF Rendering & Export

**v1 approach:** `@react-pdf/renderer` (+ `jsPDF`, `@rawwee/react-pdf-html`).
Templates were built from `<Page>/<View>/<Text>` primitives in a custom
layout engine that only approximates CSS. This works, but has three
structural drawbacks for this rebuild's goals:

- The live preview and the exported PDF are produced by **two different
  rendering engines** (react-pdf's layout engine vs. the browser), so exact
  visual parity is not guaranteed by construction — it has to be maintained
  by hand as templates evolve.
- Its layout primitives make **drag-and-drop editing** on the preview itself
  awkward — the preview is not a normal, directly-manipulable DOM tree.
- Page-break behavior (orphans/widows, avoiding a split mid-item) is
  limited to what the renderer's own layout engine supports.

**Rebuild approach:** HTML/CSS (Tailwind) templates + **Paged.js** for
pagination + **Puppeteer/Playwright** (server-side, headless Chromium) for
export.

- **Same DOM for preview and export.** Resume templates are ordinary
  React/Tailwind components — the exact same markup renders in the editor's
  live preview and in the exported document. No parallel layout engine, no
  drift between "what you see" and "what you download."
- **Pagination via Paged.js.** Paged.js (a CSS Paged Media polyfill) splits
  the live HTML into A4-sized pages directly in the browser, honoring
  `break-inside: avoid`, `break-before`/`break-after`, and orphan/widow
  rules — so the preview already shows accurate page boundaries before any
  export happens, including edge cases like a long experience entry or a
  skills list overflowing onto the next page.
- **Export via headless Chromium.** The backend (Puppeteer or Playwright)
  navigates a dedicated print-optimized route rendering that same
  template/CSS, then calls `page.pdf()`. Because it's the same browser
  engine family rendering the same DOM/CSS (including the Paged.js page
  breaks), the resulting PDF matches the on-screen preview almost exactly,
  produces **selectable text** (not a rasterized image), and stays crisp at
  any zoom level.
- **Drag-and-drop compatibility.** Since the preview is real DOM, `dnd-kit`
  (or equivalent) can operate on it directly for reordering sections/items,
  with no separate "editor model" vs. "render model" translation layer.

**Trade-off accepted:** this adds a backend rendering service (a headless
Chromium worker), which costs more compute/memory than a fully
client-side approach — accepted deliberately in exchange for style parity,
correct pagination, and selectable/searchable PDF text, all of which are
harder to get right with `@react-pdf/renderer` or with a raster-based
approach (`html2canvas` + `jsPDF`, rejected for the same reasons: image
output, no text selection, quality loss on zoom/print).

**Migration impact (frontend):**

- Drop: `@react-pdf/renderer`, `jsPDF`, `@rawwee/react-pdf-html`.
- Add: Paged.js (pagination polyfill) for the preview; templates become
  plain Tailwind/React components instead of react-pdf primitives.
- Font loading simplifies to normal web font loading (`@font-face` /
  Next.js font optimization) instead of `Font.register()` per template.

**Migration impact (backend):**

- New module/service for PDF export: launches headless Chromium
  (Puppeteer/Playwright), renders the print route, returns the PDF buffer.
- This service needs to be considered in deployment (container image size,
  memory limits, concurrency/queueing if export volume grows).

---

## Stack (carried over from v1 unless noted)

| Concern      | Choice                                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| Monorepo     | pnpm workspaces + Turborepo                                                                            |
| Frontend     | Next.js 16, React 19, Redux Toolkit, Tailwind 4                                                        |
| PDF pipeline | **Tailwind/HTML templates + Paged.js + Puppeteer/Playwright** _(new — replaces `@react-pdf/renderer`)_ |
| Backend      | NestJS 11, Prisma, Socket.IO                                                                           |
| Auth         | Clerk (JWT + Svix webhooks)                                                                            |
| AI/LLM       | Google Gemini (structured JSON + Live Audio)                                                           |
| Database     | PostgreSQL                                                                                             |
| Cache        | Redis                                                                                                  |

---

## Reference

Full implementation detail for the previous iteration (module layout,
env vars, DB schema, API reference) lives in `resume-builder-v1/docs/`.
This rebuild reuses that as a baseline for everything **except** the PDF
rendering/export pipeline described above and the admin app, which has no
v1 equivalent to reference and is designed fresh in the later planning
docs.
