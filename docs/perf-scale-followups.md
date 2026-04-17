# Perf & Scale Follow-ups

Follow-up plan for three items deferred from the Datadog-scale audit.
Context: P0/P1/P2 mechanical audit work has shipped on
`audit/p0-query-perf-consistency`. These three items need tooling,
profiler data, or design time — not covered by the autonomous pass.

---

## 1. Marketing assets → WebP

### Problem
`public/marketing/` has 14 PNGs totalling ~7 MB. They're served from
the landing, pricing, and login pages — i.e. every first-time visitor
pays this weight before they see a pixel.

### Plan
1. Install `cwebp` on the workstation (or the release runner).
2. Run `cwebp -q 80 input.png -o input.webp` for each file under
   `public/marketing/`.
3. Update `<img src>` / CSS `background-image` references to `.webp`.
   References to audit:
   - `src/app/auth/pages/LandingLogin/**`
   - `src/app/auth/pages/Pricing/**`
   - `src/features/marketing/**` (if present)
4. `git rm public/marketing/*.png`.
5. Visual QA on each page; confirm no visible quality regression at
   q=80. If any hero looks degraded, bump that single file to q=90.

### Benefit
- **~70 % asset weight reduction** (~7 MB → ~2 MB).
- **0.8–1.5 s faster LCP on 3G / slow 4G** for first-time visitors —
  landing pages stop blocking on multi-megabyte images.
- **Lower CDN egress cost** — these assets are on the hot path for
  every anonymous visitor.
- **Smaller git history over time** — new marketing drops stay under
  half a megabyte each.

### Risk
Low. Asset-only, reversible, easy to visually diff.

### Effort
~30 min once `cwebp` is available.

---

## 2. Profiler-driven `.map` / object allocation cleanup

### Problem
The initial audit flagged 40+ inline allocations — `items.map(x =>
({...}))`, `{ ...config }` spread in JSX — passed as props to child
components. Each one breaks downstream memoization: the child's props
change identity every render even when the underlying data didn't.

Blind fixing bloats the codebase without guaranteed wins. Most of the
40 don't matter (cheap, or the child isn't memoized anyway). We need
to target only the ones that show up as hot on a real profile.

### Plan
1. Preview deploy with a production build + React Profiler (keep the
   DevTools build variant so `React.memo` isn't dead-stripped).
2. Record 10-second traces on each hot page:
   - Traces explorer (paginated, 100+ rows, cycling filters)
   - Logs hub (same)
   - LLM Generations (same)
   - Overview hub (charts refreshing on time-range change)
3. In each trace:
   - Sort components by `Total commit time`.
   - For each component committing > 5 ms on idle interactions, open
     its "Why did this render?" reason.
   - If the reason is `props changed` on a prop that logically
     shouldn't have: walk up to the parent and memoize the source.
4. Stop when no component exceeds 5 ms per commit on an idle page.

### Expected targets (to verify, not assume)
- `ConfigurableDashboard` panel list builders
- `builtInDashboardPanels` dataset construction
- Select / SegmentedControl `options` arrays built inline in page
  components
- Facet model return shapes (`useLogsHubFacetModel`,
  `useTracesFacetModel`) — verify facet groups are stable end-to-end

### Benefit
- **Smoother interaction on 500+ row pages** — each unnecessary commit
  costs 5–40 ms on a mid-range laptop; eliminating them is what the
  user sees as "feels snappy vs. laggy."
- **Lower memory churn / GC pressure** — fewer throwaway arrays and
  objects per render. Matters on long-lived explorer sessions where
  the same page stays mounted for hours.
- **Makes later virtualization work cheaper** — a virtualized table
  that re-renders every row's render-prop on each parent commit is
  still slow. Stabilizing props is a prerequisite for the next item
  to deliver full value.
- **Better Lighthouse TBT / INP scores** — inline allocations during
  input handlers are a common cause of INP > 200 ms.

### Risk
Low per change — each fix is a local `useMemo` or `useCallback`.
Risk is cumulative: too many can obscure data-flow. Cap at ~10
fixes per round; stop when the profile is clean.

### Effort
~1 day per round of 5 fixes; expect 2 rounds before diminishing
returns.

---

## 3. Virtualize paginated explorer tables

### Problem
`ExplorerResultsTable` currently auto-virtualizes only in live-tail
mode (`!showPagination`). Paginated mode still runs through
`SimpleTable`, which renders every row in the DOM. With pageSize ≤ 50
that's fine; at pageSize ≥ 200 (common for Datadog-scale users
combing through an incident window) the table commits become the
bottleneck.

The prior round added `VirtualizedResultsTable` as an opt-in
alternative, but it doesn't support sticky columns, column resize, or
sorting. Flipping paginated callers over would regress those
features.

### Plan — Option C: virtualize inside SimpleTable

Chosen over a separate component because SimpleTable has ~50 call
sites; keeping a single primitive avoids bifurcation.

1. Add `virtualize?: boolean | { threshold: number }` prop. Default
   behaviour: off. Auto-on when `dataSource.length > threshold`
   (default threshold = 300).
2. When active, swap the `<tbody>` rendering to `TableVirtuoso`,
   keeping the existing `<thead>` (so sticky header CSS + sort
   indicators just work).
3. Column resize hook already updates CSS variables — verify those
   propagate into virtualized rows.
4. Sticky columns rely on `position: sticky` — should survive
   virtualization because `TableVirtuoso` reuses a single table
   element, not a scrolling list of row elements.
5. Sorting: keep `@tanstack/react-table`'s sorted-row-model
   upstream of the virtualized body; only rendering changes.
6. Unit-test the five trickiest column configs:
   - sticky-left
   - sticky-right
   - sortable-with-custom-sorter
   - resizable + sticky
   - render prop that returns a complex cell (Badge + link)
7. Visual QA on a preview deploy:
   - Traces (paginated, pageSize 500)
   - Logs (paginated + sticky service column)
   - LLM (wide row with custom render)
   - Saturation (multiple small tables)
   - Alerts
8. Ship flag-off. Enable per-page in follow-up PRs after each visual
   QA passes.

### Benefit
- **Unblocks pageSize = 500 / 1000 on explorers** — today users stuck
  paginating at 50/100 to keep the UI responsive can operate on
  Datadog-scale windows in one page. Matches what `DD` itself does.
- **~10× DOM node reduction** on long pages — fewer layout / paint
  costs, better scrolling frame time.
- **Lower memory per page** — unrendered rows aren't in the DOM, only
  in JS. Particularly valuable for multi-tab power users.
- **One-time investment, all tables benefit** — any new explorer,
  audit view, or data table added later gets virtualization for free.
- **Enables progressive loading patterns later** — once
  `TableVirtuoso` is in the primitive, cursor-based / infinite-scroll
  fetching (`endReached`) becomes a small follow-up rather than a
  rewrite.

### Risk
Medium. `SimpleTable` is used broadly (~50 call sites); a regression
touches many surfaces. Mitigated by:
- Ship flag-off (threshold = `Infinity` initially); enable per-page.
- Keep the current SimpleTable code path as the default; virtualize
  only when the prop / threshold triggers.
- Visual QA on every explorer before flipping its threshold.

### Effort
~2–3 days for the primitive change + tests. Additional ~1 day total
for visual QA + per-page rollout PRs.

---

## Sequencing

| Phase | Item                              | Blocker                       | Effort    | Impact |
| ----- | --------------------------------- | ----------------------------- | --------- | ------ |
| 1     | WebP conversion                   | `cwebp` available locally     | 30 min    | M (FCP/LCP) |
| 2     | Profiler-driven `.map` cleanup    | Preview deploy + Profiler run | 1–2 days  | M (interaction smoothness) |
| 3     | Virtualize `SimpleTable` (opt. C) | Phase 2 done, visual QA time  | 2–3 days  | H (pageSize ≥ 200 pages)   |

**Why this order:**
1 is a quick win with no dependencies.
2 tells us whether 3 is actually needed — if paginated explorers
already profile clean at pageSize=200, virtualization is premature
optimization. If they don't, 2's work also makes 3 faster by
eliminating "re-render every row" amplifiers.

---

## Verification checklist

**After Phase 1**
- [ ] `du -sh public/marketing/` reports < 2.5 MB.
- [ ] Chrome DevTools Network tab on landing page shows only `.webp`
      responses for marketing assets.
- [ ] Lighthouse LCP on landing page improves by ≥ 0.5 s.

**After Phase 2**
- [ ] React Profiler on Traces / Logs / LLM shows no component
      committing > 5 ms on idle filter / time-range cycling.
- [ ] Chrome Performance panel INP on filter click ≤ 200 ms at
      pageSize = 100.

**After Phase 3**
- [ ] Traces explorer at pageSize = 500 scrolls at 60 fps.
- [ ] DOM node count on Traces page at pageSize = 500 stays under
      3 000 (vs. ~15 000 without virtualization).
- [ ] All existing sticky / sort / resize features still work per
      visual QA script.
