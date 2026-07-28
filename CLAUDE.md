# CLAUDE.md — web

Workspace-wide standards live in `../CLAUDE.md` and apply in full here.
This file covers only what is specific to web.

## What This Repo Owns

UI, interaction, routing, and visualization. All data comes from the query
API; no business logic lives here.

## Layout

- `src/features/<feature>/` — one package per product feature; each owns its
  pages, components, hooks, and API calls.
- `src/shared/<kit>/` — code genuinely reused across features (api, search,
  logs, metrics, traces, components). Nothing feature-specific.
- `src/app/` — auth, layout, providers, store. `src/routes/` — the only place
  features are composed together.
- Boundaries are enforced in CI by `scripts/check-boundaries.mjs`: features
  never import features; `app/`/`shared/` never import features. Do not
  extend its allowlist to route around a boundary — restructure instead.

## Server State — One Policy

- All server state goes through `useStandardQuery` / `useTimeRangeQuery`
  (`src/shared/hooks/`). They carry the single retry policy: never retry 4xx,
  max 2 attempts, from the global client in `src/shared/api/queryClient.ts`.
- Never write bespoke fetch/retry/poll machinery in a feature. A UI "Retry"
  button calls `refetch()`.
- Zustand only for true client-side shared state; TanStack Query owns
  everything from the server. No module-level caches.

## React Discipline

- No `useMemo`/`useCallback` by default. Use them only for a measured
  re-render problem or an identity required by a dependency array. Hooks with
  a dozen memoizations (see `useMetricsExplorer.ts`) are the anti-pattern,
  not the house style.
- Virtualize only unbounded data (log tables, trace waterfalls) — never
  small bounded lists.
- Components small and focused; strict TypeScript, no `any`, no unnecessary
  casts.
- One data path per page. Parallel hook variants for the same view
  (`useTraceDetailData` vs `useTraceDetailEnhanced`) must be collapsed into
  one, not accumulated.
