# Optikk Frontend — Agent Rules

This file is **rules only**. Project info (paths, routes, hooks, domain mapping, conventions) lives in [CODEBASE_INDEX.md](CODEBASE_INDEX.md).

## The bar

This project is held to the **highest engineering standards**. Match the bar of the existing code: correctness, clarity, minimality, no shortcuts, no half-measures, no speculative abstraction. If a change would lower the bar — skip it, push back, or ask. "It works" is not the bar; "it is the right change, done the right way" is.

## Before any task

1. **Research is mandatory — not optional.** Before writing a single line, do the work to understand what you're about to do:
   - Read [CODEBASE_INDEX.md](CODEBASE_INDEX.md) and the actual code you'll touch — sibling features, the shared layer, the hooks/types in play.
   - Verify against authoritative docs for anything you don't already know cold (React 19, TanStack Router/Query, Zustand 5, Tailwind, Vite, MDN, WCAG).
   - For anything non-trivial — new architectural patterns, performance work, state-management redesigns, virtualization, caching strategies, accessibility, concurrency — **read the relevant research papers, RFCs, and engineering write-ups** before designing. The React, TanStack, observability, and frontend-performance communities have well-known prior art; use it. "I haven't read it but I think…" is not acceptable.
   - Borrowing an existing pattern from this repo beats inventing one. Inventing one without checking what's already there, or designing something subtle without checking what the literature already says, is a violation.
2. **Do not modify files** until the user approves the plan (except trivial one-line fixes).

## After every iteration

After completing any task — no matter how small — review and update [CODEBASE_INDEX.md](CODEBASE_INDEX.md) if anything changed: new features, routes, hooks, types, dashboard panels, cross-repo contracts.

This is **mandatory**, not optional. The documentation must always reflect the current architecture so the next session (by any AI tool) does not need to scan the full codebase. If nothing changed, skip — but always check.

## Code patterns

- **Dashboard queries**: stable keys (no `refreshKey`), use `useInvalidateQueriesOnAppRefresh`.
- **Explorer queries**: include `refreshKey` in `queryKey`.
- **Logs results**: keep cursor pages explicit (`list.pages` + footer controls), not infinite-scroll append.
- **Always**: `placeholderData: keepPreviousData`; loading = `isPending && data === undefined`.
- **No cross-feature imports** — convention; move shared code to `@shared/`.
- **No TS enums** — use `as const` + union types.
- **No `as any`** — use `dynamicNavigateOptions` / `dynamicTo` for router casts, `Record<string, unknown>` for data, `unknown as { keys: ... }` for Zod internals.
- **API naming**: GET operations use `get*` prefix (not `fetch*`); `fetch*` is reserved for the Fetch API itself.
- **Prefer `useStandardQuery`** over raw `useQuery` for consistent defaults.

## Engineering principles

- **SOLID & DRY**: factor shared behavior when a pattern appears more than once.
- **Quality**: leave the code clearer or simpler with every change.
- **No unsolicited tests**: do not add tests unless explicitly asked.
- **No god files or functions**: every function has a single responsibility; every file has a single responsibility.

