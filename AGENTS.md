# Optikk Frontend — Agent Rules

This file is **rules only**. Project info (paths, routes, hooks, domain mapping, conventions) lives in [CODEBASE_INDEX.md](CODEBASE_INDEX.md).

## ## Before any task

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

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
- **One home per formatter**: display formatting (`formatNumber`, `formatDuration`, `formatRelativeTime`, …) imports from `@shared/utils/formatters` — never define a local `format*`/`timeAgo` helper in a component (enforced by `yarn check:dupes`).

## Engineering principles

- **SOLID & DRY**: factor shared behavior when a pattern appears more than once.
- **Quality**: leave the code clearer or simpler with every change.
- **No unsolicited tests**: do not add tests unless explicitly asked.
- **No god files or functions**: every function has a single responsibility; every file has a single responsibility.

