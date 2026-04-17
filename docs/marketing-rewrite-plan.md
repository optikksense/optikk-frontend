# Marketing Rewrite — Lightweight, Image-Free

## Why
Current marketing surface is a major load-time liability:

- **6.6 MB** of unoptimised PNGs in `public/marketing/` (14 files).
- **~2 500 LOC** across `src/app/auth/pages/{LandingLogin,Pricing}/**`
  with a full set of bespoke layouts, mockups, and animations.
- **framer-motion** + motion-dom + motion-utils bundled as the
  `marketing-runtime` chunk purely for marketing page animations.
- Heavy hero dashboards rendered on routes that every first-time
  visitor hits (`/`, `/features`, `/pricing`, `/architecture`,
  `/opentelemetry`, `/self-host`).

There's already a skeleton of a lighter, content-driven marketing
surface at `src/features/marketing/MarketingPage.tsx` + `content.json`
+ `src/app/router/marketing-routes.tsx`, but it's orphaned — the live
router (`src/app/routes/router.tsx`) still points at the heavy pages.

This plan wipes the heavy pages and replaces them with a single
content-driven, image-free, animation-free marketing shell that any
non-engineer can edit via JSON.

## Goals

1. **Zero raster images** on marketing routes. Decorative glyphs must
   be inline SVG or CSS.
2. **Total marketing JS payload ≤ 30 KB gzipped** (including layout
   + nav + footer). Today it's several hundred KB.
3. **Editable without TypeScript** — copy, routes, CTAs, feature
   bullets all live in a single JSON (or MDX) file.
4. **No framer-motion dependency in the marketing chunk**.
5. **Routes preserved** so existing inbound links don't 404.

## Scope

### Delete
- `src/app/auth/pages/LandingLogin/LandingPage.tsx` (+ `.css`)
- `src/app/auth/pages/Pricing/` entire directory
- `public/marketing/*.png` (14 files, 6.6 MB)
- `src/config/marketingPages.css`, `src/config/marketingChrome.css`
- Vite `manualChunks` bucket `marketing-runtime` (now empty).
- `framer-motion` dependency if no other consumer survives (verify).

### Keep / promote
- `src/features/marketing/MarketingPage.tsx` → rename to
  `MarketingShell.tsx`, expand to full layout.
- `src/features/marketing/content.json` → canonical source of truth
  for every marketing page.
- `src/app/router/marketing-routes.tsx` → wire into the real router.

### Add
- `src/features/marketing/MarketingLayout.tsx` — nav + footer,
  inline SVG logo.
- `src/features/marketing/sections/` — small set of reusable blocks
  (hero, feature-grid, cta, split, faq). All pure-CSS, no motion.
- `src/features/marketing/svg/` — 3-5 inline SVG motifs to replace
  decorative imagery (a gradient backdrop, a glyph set for feature
  cards, an OTel logo).

## Plan

### Step 1 — Delete the heavy surface
1. Remove `src/app/auth/pages/LandingLogin/` and
   `src/app/auth/pages/Pricing/`.
2. `git rm public/marketing/*.png`.
3. Remove the `marketing-runtime` branch from `vite.config.ts`
   `manualChunks`.
4. Drop `framer-motion` from `package.json` if no import survives
   (grep first).
5. Delete orphaned CSS (`marketingPages.css`, `marketingChrome.css`).

### Step 2 — Wire the lightweight router
1. In `src/app/routes/router.tsx`, replace the six lazy imports and
   `marketingRoutesGroup` with a single lazy import of
   `src/features/marketing/MarketingShell.tsx`, used by all six
   paths (plus any future ones).
2. Each path reads its content block from `content.json` by slug.
3. Keep `LoginPage` as-is on `/login`.

### Step 3 — Content model
`content.json` shape:

```json
{
  "nav": [
    { "label": "Product", "path": "/features" },
    { "label": "Pricing", "path": "/pricing" }
  ],
  "footer": [
    { "label": "GitHub", "href": "…" }
  ],
  "pages": [
    {
      "path": "/",
      "sections": [
        { "kind": "hero", "eyebrow": "…", "title": "…", "body": "…", "primaryCta": { "label": "Sign in", "path": "/login" } },
        { "kind": "feature-grid", "items": [ { "title": "…", "body": "…", "icon": "logs" } ] },
        { "kind": "cta", "title": "…", "body": "…", "cta": { … } }
      ]
    }
  ]
}
```

Section types supported:
- `hero` — eyebrow, title, body, primary/secondary CTA.
- `feature-grid` — 3-column bullets with inline-SVG glyphs.
- `split` — copy on one side, highlight list on the other.
- `cta` — single large call-to-action strip.
- `faq` — accordion (`<details>`) — zero JS.
- `code-block` — `<pre>` snippet (for OTel quickstart page).

Each page composes sections; new sections added in one place.

### Step 4 — Visual system
- Typography already exists via design tokens.
- Backgrounds use CSS gradients referencing
  `var(--bg-secondary)` / `var(--color-primary)`.
- All glyphs are inline SVG components (tree-shakeable, no extra
  network requests).
- Animation: CSS only (`@keyframes fadeUp` on hero — one keyframe,
  200 bytes).

### Step 5 — Accessibility & SEO
- Single `<main>` per page, one `<h1>`.
- Nav marked `<nav aria-label="Marketing">`.
- Each page sets `<title>` + meta description via
  `document.title` from `content.json`.
- FAQ uses native `<details>` / `<summary>` for free keyboard +
  screen-reader support.

### Step 6 — CI checks
Add a size gate to prevent regression:
- Fail CI if `public/marketing/` contains any non-SVG file.
- Fail CI if the marketing chunk exceeds 30 KB gz.

## Benefits

- **−6.6 MB static asset weight**, entirely removed from the repo
  and CDN.
- **−200 KB+ gzipped JS** off the marketing chunk (framer-motion +
  bespoke components gone).
- **Near-instant LCP on `/`, `/pricing`, `/features`** — no large
  images, no animation runtime, content is text + inline SVG.
- **Edit-without-redeploy path** unlocked — content becomes a JSON
  file that a PM/marketer can patch in a PR without touching TSX.
- **One file to style** (`MarketingShell.tsx` + a small section
  library) vs. ten bespoke pages with overlapping styles.
- **Fewer bundles, faster cold-start** — removing the
  `marketing-runtime` chunk speeds up initial parse on landing.
- **Lower CI time** — fewer lazy chunks to build, type-check, and
  analyse.
- **Future-proof** — adding a new marketing page = one entry in
  `content.json`, no route / component work.

## Risk

Low — these pages are purely anonymous, marketing-only. No
authenticated flows, no app state. Rollback = `git revert` of the
single rewrite commit.

**Verify before shipping:**
- All six existing URLs still 200.
- `/login` still works (not covered by the rewrite but adjacent).
- No other consumer of framer-motion before removing the dep
  (`rg "from \"framer-motion\""`).
- Visual review of all six pages on the preview deploy.

## Sequencing

1. **PR 1 — Delete heavy surface + wire lightweight shell on all
   six routes** (≈ ½ day). Ships noticeable win immediately.
2. **PR 2 — Content + section library polish** (≈ ½ day). Real
   copy, SVG set, CSS refinements.
3. **PR 3 — Size gate + `framer-motion` removal** (≈ 1 hour).

Each PR is independently shippable and reversible. Total effort ≈
1 day of focused work.

## Out of scope (explicit non-goals)

- SEO analytics / sitemap generation — lives in a later SEO pass.
- Dynamic CMS backend — JSON content is intentional; moving to a CMS
  is a separate decision.
- A/B testing infra for CTAs — premature.
- Marketing-specific theming / dark-mode switch — inherit the app
  theme.
