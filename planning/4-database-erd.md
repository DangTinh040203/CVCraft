# 4. Database ERD

Baseline is v1's resume schema (`resume-builder-v1/apps/be/.../prisma/schema/*.prisma`),
carried over as-is per `0-project-desc.md`, **plus** the minimum additions
needed for features that are new or expanded in this rebuild: admin roles
(Phase 1), drag-and-drop ordering (Phase 4/9), a template & font catalog and
feature flags (Phase 8), and AI cost/usage logging (Phase 5/8).

**Deliberately unchanged from v1:** job-matching, email-generation, and
live-interview stay **ephemeral** — computed per-request and returned to the
client, nothing written to the DB for their content (no `JobMatch`, `Email`,
or `Interview`/`InterviewMessage` tables). This isn't an oversight, it's v1's
actual design (confirmed in `docs/features/*.md`), and no planning doc so far
asks for history/re-visit of past matches, emails, or interviews — only their
**usage/cost** needs to be persisted, which `AiUsageLog` below covers. If a
future feature wants "see your past interview feedback," that's a new
requirement to raise explicitly, not something silently assumed here.

---

## ERD

Naming keeps `id`/`Resume` (not `_id`/`CV`) to match the Prisma/Postgres
convention v1's actual code already uses, and what the rest of these
planning docs call it — only the table/field/`Ref:` syntax below changes.
Every relation gets an explicit FK column (`resumeId`, `userId`, ...)
because Prisma/Postgres need a real column to enforce it, not just an
array field on the parent.

**Resolves the earlier open question:** modeled here as **one user, many
resumes** (`User.id` `<` `Resume.userId`, not unique) — dropping v1's 1:1
constraint. Flagging this so it's a deliberate, visible choice rather than
a silent diff from the previous version of this doc.

```dbml
table User {
  id string PK
  providerId string
  provider string
  firstName string
  lastName string
  email string unique
  avatar string
  role string // user | admin, default user
  createdAt Date
  updatedAt Date
}

table Resume {
  id string PK
  userId string
  templateId string
  fontId string
  title string
  subTitle string
  overview string
  avatar string
  format json // color, spacing, dateFormat, hiddenSections[], sectionOrder[]
  informations ResumeInformation[]
  educations Education[]
  workExperiences WorkExperience[]
  projects Project[]
  skills Skill[]
  certifications Certification[]
  languages Language[]
  createdAt Date
  updatedAt Date
}

table ResumeInformation {
  id string PK
  resumeId string
  label string
  value string
  order number
}

table Education {
  id string PK
  resumeId string
  school string
  degree string
  major string
  startDate Date
  endDate Date // Date or null = "Present"
  order number
}

table WorkExperience {
  id string PK
  resumeId string
  company string
  position string
  description string
  startDate Date
  endDate Date // Date or null = "Present"
  order number
}

table Project {
  id string PK
  resumeId string
  title string
  subTitle string
  details string
  technologies string
  position string
  responsibilities string
  domain string
  demo string
  order number
}

table Skill {
  id string PK
  resumeId string
  label string
  value string
  order number
}

table Certification {
  id string PK
  resumeId string
  name string
  issuer string
  date Date
  order number
}

table Language {
  id string PK
  resumeId string
  name string
  description string
  order number
}

table Template {
  id string PK
  key string unique // maps to FE component, e.g. "template-01"
  slug string unique // public URL id, generated from name + id, e.g. "minimalist-cm4x9k2p0000"
  name string
  thumbnailUrl string
  isActive boolean
  isPremium boolean // false = free/unlocked for everyone by default
  priceCents number // null when isPremium = false
  createdAt Date
  updatedAt Date
}

table UserTemplateUnlock {
  id string PK
  userId string
  templateId string
  source string // purchase | promo | admin_grant
  unlockedAt Date
  // unique (userId, templateId) — a user unlocks a given template at most once
}

table Font {
  id string PK
  family string unique
  source string // Google Fonts name or self-hosted URL
  isActive boolean
  createdAt Date
}

table FeatureFlag {
  id string PK
  key string unique
  label string
  enabled boolean
  updatedAt Date
}

table AiUsageLog {
  id string PK
  userId string
  feature string // RESUME_PARSE | JOB_MATCH | EMAIL_GENERATION | INTERVIEW_LIVE | INTERVIEW_EVAL
  model string
  tokensIn number
  tokensOut number
  costUsd decimal
  createdAt Date
}

Ref: "User"."id" < "Resume"."userId"
Ref: "User"."id" < "AiUsageLog"."userId"

Ref: "Resume"."id" < "ResumeInformation"."resumeId"
Ref: "Resume"."id" < "Education"."resumeId"
Ref: "Resume"."id" < "WorkExperience"."resumeId"
Ref: "Resume"."id" < "Project"."resumeId"
Ref: "Resume"."id" < "Skill"."resumeId"
Ref: "Resume"."id" < "Certification"."resumeId"
Ref: "Resume"."id" < "Language"."resumeId"

Ref: "Template"."id" < "Resume"."templateId"
Ref: "Font"."id" < "Resume"."fontId"

Ref: "User"."id" < "UserTemplateUnlock"."userId"
Ref: "Template"."id" < "UserTemplateUnlock"."templateId"
```

`FeatureFlag` has no relation to anything else — it's a standalone
key/value config table read by both `apps/client`/`apps/admin` (flag check)
and written only from `apps/admin` (Phase 8's "simple on/off UI").

---

## What's carried over unchanged from v1

`User`, `Resume`, `ResumeInformation`, `Education`, `WorkExperience`,
`Project`, `Skill`, `Certification`, `Language` — same fields, same
`onDelete: Cascade` chain from `User` down through `Resume` to every child
table. See `resume-builder-v1/docs/database.md` for the field-by-field
reference; only the deltas are called out below.

## What's new or changed for the rebuild, and why

| Change                                                                                                                                         | Where                              | Why                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `User.role` (`user` \| `admin`, default `user`)                                                                                                | `User`                             | Needed by `AdminGuard` (Phase 1/8) to gate `apps/admin`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `order Int` on every section child table (`ResumeInformation`, `Education`, `WorkExperience`, `Project`, `Skill`, `Certification`, `Language`) | those tables                       | v1 has no such field — order was implicit (array/DB insertion order), fine without drag-and-drop. Core Function 9 (DnD reordering, Phase 4) is new/first-class in this rebuild, so item order must be explicitly persisted or it resets on reload.                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `Resume.templateId` (FK → `Template`), `Resume.fontId` (FK → `Font`), `Resume.format` (JSON)                                                   | `Resume`                           | v1's template/font/format choice lived only in FE Redux state (`stores/features/template.slice.ts`), never persisted server-side. Persisting it on `Resume` makes template/format survive across devices/sessions, not just `redux-persist`'s local storage. `format` stays a JSON blob (not normalized columns) because its shape (color, spacing, date format, hidden sections, section order) is v1's own loosely-typed `Format` object and will keep gaining knobs in Phase 4 — a JSON column avoids a migration per new knob.                                                                                                                                                                 |
| `Template`, `Font` catalog tables                                                                                                              | new                                | Phase 8 explicitly gives admin "template & font catalog management" — that only makes sense if templates/fonts are DB rows admins can add/disable, not a hardcoded list in FE code as in v1. `isActive` lets admin retire a template/font without breaking resumes that already reference it (don't hard-delete a `Template`/`Font` row that's still referenced — enforce via app logic, not `onDelete: Restrict`, so an admin can't accidentally 500 the editor).                                                                                                                                                                                                                                 |
| `Template.slug` (unique, `slugify(name) + '-' + id`)                                                                                           | `Template`                         | Public-facing identifier for URLs (`/builder?template=minimalist-cm4x9k2p0000`) instead of exposing the internal `key` (`template-01`). `key` stays as the FE component mapping; `slug` is only for URLs. Generated server-side on create (the `id` must exist first, so generate the id in app code, or create then update). The `id` suffix keeps it unique even if two templates share a name. Keep it stable on rename so old links don't break: either don't regenerate it, or resolve by the trailing `id` and redirect to the current slug when the name part is stale. |
| `FeatureFlag` table                                                                                                                            | new                                | Phase 8: "flags table + simple on/off UI", explicitly called "start minimal" — a flat key/enabled/label table is intentionally as small as that phase asks for.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `AiUsageLog` table                                                                                                                             | new                                | Phase 5: "instrument every RagService call with token/cost logging (tagged by user + feature)... feeds the Admin AI-usage dashboard in Phase 8." v1 never persisted this — this table exists purely for the rebuild's new admin analytics, not for replaying past AI results.                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `Template.isPremium`/`priceCents`, `UserTemplateUnlock` table                                                                                  | new — **not in any current phase** | Added speculatively because you raised "unlock templates via payment" as a future direction. `UserTemplateUnlock` is many-to-many (a user can unlock several premium templates over time), so it's a join table, not a flag on `User`. **This is not scoped into any phase in `2-implementation-phases.md`** — no payment/Stripe module, no webhook handling, no "what happens to unlocks on refund" logic exists yet. Treat this as reserving the shape in the schema, not a commitment to build monetization now; if/when it's actually scheduled, it deserves its own phase (payment provider, webhook verification, refund/chargeback handling belong there, not quietly folded into Phase 8). |

## Open assumptions to confirm before Phase 2 schema lock-in

- **`User`–`Resume` cardinality is now 1:N** (many resumes per user, no
  `unique` on `Resume.userId`) — a deliberate change from v1's 1:1, per the
  latest version of this ERD. This is a bigger UX change than the schema
  diff alone shows: it implies a resume-list view (pick/create/delete among
  several resumes) that doesn't exist in v1's single-resume flow, so Phase 2
  needs that list UI in scope, not just the relaxed constraint.
- **`AiUsageLog.userId` behavior on user deletion.** Modeled here as
  `onDelete: Cascade` for consistency with every other `User`-owned table,
  but that erases historical cost data the moment an account is deleted —
  which may fight Phase 8's admin analytics (e.g. lifetime AI spend
  reporting). Alternative: make `userId` nullable with `onDelete: SetNull`,
  keeping aggregate log rows (attributed to a deleted account) for
  reporting. Pick one deliberately in Phase 5 rather than defaulting silently.
- **`Template`/`Font` seeding.** These are new catalog tables with no v1
  equivalent — Phase 2/4 needs a seed script inserting v1's existing 5
  templates (and whatever fonts they use today) as the initial catalog rows,
  otherwise the editor has no templates to pick from on a fresh DB.
- **Section/item reordering needs no further schema work.** The `order`
  column already on every section-child table, plus `sectionOrder`/
  `hiddenSections` inside `Resume.format`, are enough to persist a
  drag-and-drop reorder of both sections and items within a template's
  existing structure. Nothing further to add here unless the ask grows into
  a freeform layout builder (moving elements outside a template's fixed
  slots) — that would need a real layout-tree model, a much bigger change
  not reflected in this ERD.
- **`UserTemplateUnlock` / `Template.isPremium` are a schema placeholder,
  not a committed feature.** They model "a user can unlock N premium
  templates" correctly _if_ per-template unlocking is the monetization
  shape chosen later. If it turns into subscription tiers instead (a `Plan`
  a user is on, granting access to a set of templates), `UserTemplateUnlock`
  may become redundant in favor of checking `Plan` membership — don't build
  payment/webhook logic against this table until the monetization model is
  actually decided.
