# Single-Responsibility Decomposition Plan — 5 God Files

5 files over 200 LOC that also contain ≥ 40-line functions (or a god
component). One focused plan per file, sequenced so each PR is
self-contained and low-risk.

## Guiding principles

- **Orchestrator owns hooks + state + data fetching only**.
- **Sections/tabs are memoised, take data via props, render.**
- **Pure logic (parsers, formatters, reducers) lives in `utils.ts`
  under the feature folder, not inside the component.**
- **Types live in `types.ts` once a file hosts more than one
  non-trivial shape.**
- **No new behaviour. No new abstractions. Diffs should read as
  moved code only.**
- **After decomposition: no file > 300 LOC; no function > 60 LOC.**

---

## 1. `DeploymentCompareDrawer.tsx` — 663 LOC

### Inventory
- `SummaryCard` — 40-line sub-component (line 136).
- Root orchestrator `DeploymentCompareDrawer` — big useMemo parsing
  seed (45 lines, line 233) + JSX with inline cards, 3 timelines,
  2 inline useQuery calls.

### Target decomposition
```
src/features/overview/components/deployment-compare/
  index.tsx                         # orchestrator, < 200 LOC
  types.ts                          # DeploymentSeed, CompareView, …
  utils.ts                          # parseDeploymentSeed, classifyDelta, …
  hooks/
    useDeploymentCompare.ts         # replaces 2 inline useQuery
  components/
    DeploymentCompareHeader.tsx     # title, identity, close
    DeploymentCompareSummaryCards.tsx   # extracts SummaryCard + grid
    DeploymentCompareTimeline.tsx   # error-rate + latency trend
    DeploymentCompareMetrics.tsx    # rps / p95 / p99 deltas
    DeploymentCompareFooter.tsx     # CTA + legend
```

### Expected shape after
- `index.tsx` ≈ 180 LOC — reads seed, calls `useDeploymentCompare`,
  passes slices to 4 memoised children.
- Each child ≤ 120 LOC.
- `parseDeploymentSeed` moves to pure function in `utils.ts`, gets
  unit-testable without rendering.

### Effort / risk
~½ day, **low risk** — pure mechanical extraction; no logic change.

---

## 2. `AlertRuleBuilderPage.tsx` — 659 LOC

### Inventory
- One 449-line god-component — a 5-step wizard with every step's JSX
  nested inline plus step validation, preview fetch, slack-test
  mutation, autosave.

### Target decomposition
```
src/features/alerts/pages/AlertRuleBuilderPage/
  index.tsx                         # orchestrator, < 200 LOC
  types.ts                          # StepKey, AlertPrefill, payload …
  steps.ts                          # STEPS array + titleForPreset
  hooks/
    useAlertRuleBuilder.ts          # state machine: payload, step,
                                    #   advance/back, dirty, autosave
    useAlertRulePreview.ts          # debounced preview mutation
  components/
    AlertRuleStepIndicator.tsx      # progress rail
    AlertRuleBuilderFooter.tsx      # prev / next / save / test
    steps/
      AlertTypeStep.tsx             # preset picker
      AlertScopeStep.tsx            # services / filters
      AlertConditionStep.tsx        # expression + preview panel
      AlertDeliveryStep.tsx         # channels + slack test
      AlertReviewStep.tsx           # summary + save
```

### Expected shape after
- `index.tsx` ≈ 150 LOC: calls the two hooks, maps `step` →
  step component, renders indicator + footer.
- Each step component ≤ 150 LOC.
- `useAlertRuleBuilder` is the single source of truth for the
  builder's in-memory state — unblocks testing the state machine
  without mounting the page.

### Effort / risk
~1 day, **medium risk** — the state machine has subtle interaction
with the preview and slack-test mutations. Land with a smoke test
pass on create + edit flows.

---

## 3. `DatastoreDetailPage/index.tsx` — 516 LOC (500-LOC main fn)

### Inventory
- One god-component that:
  - parses URL params,
  - composes 3 dashboards,
  - derives 6 metric cards,
  - paints a connection-pool timeline,
  - renders a query-latency heat-map.

### Target decomposition
```
src/features/saturation/pages/DatastoreDetailPage/
  index.tsx                         # orchestrator, < 200 LOC
  constants.ts                      # DATASTORE_METRIC_FIELDS, …
  hooks/
    useDatastoreDetailData.ts       # pulls all 3 query sources
    useDatastoreMetrics.ts          # derives tile rows from raw data
  components/
    DatastoreDetailHeader.tsx
    DatastoreMetricTiles.tsx        # 6-tile grid
    DatastorePoolTimeline.tsx       # connection-pool chart
    DatastoreQueryHeatmap.tsx       # latency heat-map
    DatastoreTopQueriesTable.tsx    # the inline table
```

### Expected shape after
- `index.tsx` ≈ 140 LOC.
- Every visual is a memoised leaf with a single responsibility.

### Effort / risk
~½ day, **low risk** — no business logic; the page mostly maps data
to visuals.

---

## 4. `SpanDetailDrawer/index.tsx` — 456 LOC

### Inventory
- One file with **four tab components** inlined:
  - `VirtualizedAttrTable` (56 LOC)
  - `AttributesTab` (113 LOC)
  - `EventsTab` (70 LOC)
  - `SelfTimeTab` (73 LOC)
  - `RelatedTab` (46 LOC)
- Plus the drawer shell + tab-switcher.

### Target decomposition
```
src/features/traces/components/SpanDetailDrawer/
  index.tsx                         # drawer shell + tab router, < 180 LOC
  types.ts                          # SpanAttributes, SpanSelfTime, …
  tabs/
    AttributesTab.tsx               # + VirtualizedAttrTable colocated
    EventsTab.tsx
    SelfTimeTab.tsx
    RelatedTab.tsx
```

### Expected shape after
- `index.tsx` holds only the drawer chrome + the tab dispatch.
- `VirtualizedAttrTable` stays inside `AttributesTab.tsx` — it's an
  implementation detail of that tab, not reusable elsewhere.

### Effort / risk
~2 hours, **trivial risk** — pure file-split; the tab components
already take props, not shared closure state.

---

## 5. `TraceDetailPage/index.tsx` — 418 LOC

### Inventory
- 48-line `traceTimeBounds` useMemo (line 54).
- Memoised `logColumns` (already extracted in an earlier round).
- Still renders waterfall + span detail + related logs + raw JSON
  drawer all inline.

### Target decomposition
```
src/features/traces/pages/TraceDetailPage/
  index.tsx                         # orchestrator, < 180 LOC
  constants.ts                      # LOG_COLUMNS def
  utils.ts                          # computeTraceTimeBounds
  hooks/
    useTraceTimeBounds.ts           # wraps computeTraceTimeBounds
  components/
    TraceDetailHeader.tsx           # breadcrumbs + copy-link actions
    TraceDetailSpanSection.tsx      # waterfall + span detail panel
    TraceDetailLogsSection.tsx      # correlated-logs table
    TraceDetailRawPanel.tsx         # JSON drawer
```

### Expected shape after
- `index.tsx` ≈ 150 LOC, purely orchestration.
- `computeTraceTimeBounds` becomes a pure fn — unit-testable.
- `logColumns` moves to `constants.ts` (it's already a constant
  wrapped in `useMemo([], ...)`; no deps — no reason for it to live
  inside the component).

### Effort / risk
~½ day, **low risk** — clean slice lines already exist in the JSX.

---

## Sequencing

| PR | Target file                          | Effort | Risk    | Why this order                              |
| -- | ------------------------------------ | ------ | ------- | ------------------------------------------- |
| 1  | `SpanDetailDrawer/index.tsx`         | 2 h    | trivial | Warms up the decomposition pattern; fastest win. |
| 2  | `TraceDetailPage/index.tsx`          | ½ d    | low     | Adjacent feature, reuse of patterns from PR 1. |
| 3  | `DeploymentCompareDrawer.tsx`        | ½ d    | low     | Largest drawer; mirrors the SpanDetailDrawer split. |
| 4  | `DatastoreDetailPage/index.tsx`      | ½ d    | low     | Standalone, no cross-feature risk.          |
| 5  | `AlertRuleBuilderPage.tsx`           | 1 d    | medium  | State-machine refactor; land last with smoke-test pass. |

Total: **~3 days**, five independently shippable PRs, each
reversible with a single revert.

## Success criteria per PR

- `yarn type-check` / `yarn lint` / `yarn build` pass.
- No file in scope exceeds 300 LOC.
- No function in scope exceeds 60 LOC.
- Visual diff on the affected pages is zero — pure refactor.
- Extracted pure functions are directly unit-testable (enables
  future test coverage without blocking on a harness).

## What this PR batch does **not** attempt

- Test coverage (separate follow-up once the SRP split lands).
- Performance work (round 1 + round 2 already shipped).
- Feature changes or UX polish.
- Renaming exported types/components (preserve imports).
