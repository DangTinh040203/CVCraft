# 3. PDF Pipeline — Proven Reference Implementation

`resume-pdf-mvp` (sibling repo: `../resume-pdf-mvp`) is a working spike that
already proves out the architecture described in `0-project-desc.md` and
picked in `1-tech-stack.md`: **one Tailwind/React component, two renderers**
(Paged.js in-browser for preview, headless Chromium on the backend for
export). Phase 3 should treat this MVP as the reference implementation to
port/adapt into `apps/client` + `apps/backend`, not a from-scratch spike —
the risky unknowns below are already resolved.

Stack proven there: React 19 + Vite + Tailwind v4 + Paged.js (FE), Node/
Express 5 + Puppeteer (BE). The rebuild's FE is Next.js 16 instead of Vite —
see the Turbopack gotcha below, the one piece that does **not** port as-is.

---

## The one-component architecture (validated)

- A single template component (`ResumeContent.jsx` in the MVP) takes a
  `resume` prop and renders the whole document — no PDF-renderer primitives,
  just `<div>`/Tailwind. It is reused **verbatim** at two routes:
  - `/` — wrapped by a Paged.js bridge component for the live, paginated
    on-screen preview.
  - `/print` — rendered bare, no Paged.js, no editor chrome. This is the
    route the backend's headless Chromium navigates to.
- Reuse of the exact same component + exact same CSS is what makes preview
  and exported PDF match **by construction**, not by manual upkeep.

## Single source of truth for page size: one `@page` CSS rule

```css
@page {
  size: 210mm 297mm; /* A4 */
  margin: 14mm;
}
```

Declared once, globally, never imported by name — both engines discover it
on their own:

- FE: `previewer.preview(content, undefined, targetEl)` — leaving
  `stylesheets` as `undefined` tells Paged.js "collect every loaded
  stylesheet," which includes this rule.
- BE: `page.pdf({ preferCSSPageSize: true })` — tells Chromium to prefer
  this page's own `@page` rule over Puppeteer's default page-size options.
  **Easy to miss, critical**: without `preferCSSPageSize: true`, Puppeteer
  silently falls back to Letter/whatever `format` was passed and the FE's
  `@page` rule is ignored.

## Pagination correctness rules

- Every job/education/project block needs Tailwind's `break-inside-avoid`
  (→ CSS `break-inside: avoid`) so neither engine cuts a page in the middle
  of one entry.
- Font sizes in `pt` (`text-[10.5pt]`), not `px`/`rem` — standard print unit,
  keeps preview and PDF visually consistent with print expectations.

## Backend export route (port to a NestJS module)

```js
app.get('/api/resume.pdf', async (req, res) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`${FRONTEND_URL}/print`, { waitUntil: 'networkidle0' });
  const pdf = await page.pdf({
    printBackground: true,
    preferCSSPageSize: true,
  });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
  res.send(pdf);
});
```

The backend does no rendering itself — it opens a real headless browser,
navigates to the FE's print route, and asks Chromium to print. **MVP
intentionally launches a fresh browser per request** — Phase 3 must not
carry that over as-is: keep one long-lived `puppeteer.launch()` instance
and call `newPage()` per request, to avoid a ~1-2s cold start on every
export (already flagged as a known gap in the MVP's own README).

## Gotchas already hit and resolved — re-apply, don't rediscover

1. **React `<StrictMode>` breaks Paged.js.** Strict Mode double-invokes
   `useEffect` in dev, so `Previewer.preview()` runs twice concurrently,
   both doing imperative DOM surgery on the same source/target refs →
   `Cannot read properties of null (reading 'getBoundingClientRect')`.
   Paged.js is not safe under Strict Mode's double-invoke. Fix used: drop
   `<StrictMode>` around the preview tree entirely, rather than patching the
   library. Needs a decision for `apps/client` (Next.js has Strict Mode on
   by default) — likely scope the exclusion to just the resume-preview
   subtree/route, not the whole app.

2. **`import('pagedjs')` breaks under Next.js/Turbopack — this is the one
   MVP finding that does NOT transfer directly**, since the MVP itself runs
   Vite, not Next.js. A bare `import('pagedjs')` works fine under Vite
   (esbuild pre-bundling handles the CJS/ESM interop), but under
   Next.js/Turbopack the same import throws `contains.call is not a
function` (Turbopack processes pagedjs's raw ESM source differently).
   **Workaround identified for the Next.js case:** copy
   `node_modules/pagedjs/dist/paged.esm.js` into `public/` and import it as
   a static URL, bypassing the bundler's module resolver. Verify this
   workaround still holds against whatever pagedjs/Next.js versions Phase 3
   actually pins — it was found against the MVP's dependency versions, not
   necessarily the rebuild's.

3. **`preferCSSPageSize: true` is mandatory** on `page.pdf()` — see above.

4. Puppeteer needs `FRONTEND_URL` (env var) to know where to navigate for
   `/print` — in the monorepo this becomes a proper env var
   (`Env.FRONTEND_URL` via the Joi schema in `1-tech-stack.md`), consistent
   with how `apps/backend` already needs to know the FE origin for CORS.

## Verification method (reuse for Phase 3's DoD test matrix)

From the MVP README — a cheap, repeatable way to confirm preview and PDF
actually match, beyond eyeballing:

```bash
# Page count parity
pdfinfo resume.pdf | grep Pages
# compare against the "Rendered as N page(s)." preview status line

# Character-count parity (order-independent — catches dropped/duplicated text)
pdftotext -layout resume.pdf - | tr -d '[:space:]' | wc -c
# compare against, in the browser devtools console on the preview route:
#   [...document.querySelectorAll('.pagedjs_page')].map(p=>p.textContent).join('').replace(/\s/g,'').length
```

**Caveat:** `pdftotext -layout` reconstructs reading order from X/Y
position, so it can disagree with DOM order in 2-column areas (e.g.
certifications/languages side-by-side) or right-aligned dates, even when
the rendered PDF is visually correct. Use this for count parity only; use
a direct visual/screenshot comparison to check order/position.

## What the MVP deliberately left out (still open for Phase 3+)

- Real editor / CRUD (MVP data is hardcoded) — covered by Phase 2 already.
- Template picker / multiple templates — Phase 4.
- The `Format` object (color/font/spacing controls) from v1's plan —
  Phase 4.
- Production browser lifecycle (long-lived instance, concurrency/queueing
  under load) — flagged in `1-tech-stack.md`'s deployment gotchas and
  Phase 10's load-check item, not solved by the MVP.
