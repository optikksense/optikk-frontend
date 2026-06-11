# Optikk Frontend — Claude Developer Guide

## Core Commands

### Development & Build
- Run local dev server: `yarn dev`
- Build production assets: `yarn build`
- Run local preview: `yarn preview`
- Deploy to Firebase Hosting: `yarn deploy:firebase`

### Linting & Formatting
- Lint check: `yarn lint`
- Lint fix & autoformat: `yarn lint:fix`
- File formatting: `yarn format`

### Code Verification & CI
- TypeScript type-check: `yarn type-check`
- Verify theme colors rule: `yarn check:colors`
- Verify formatter duplication: `yarn check:dupes`
- Run full CI pipeline checks: `yarn ci`

---

## Key Development Rules & Guidelines

### 1. Code Quality & Formatting
- **Linting**: Follow strict Biome guidelines. Run `yarn lint:fix` before committing.
- **Formatters**: All display formatting (`formatNumber`, `formatDuration`, `formatRelativeTime`) MUST be imported from `@shared/utils/formatters` (enforced by `yarn check:dupes`). Never write local formatters.

### 2. Styling & Theme Colors
- **Light Theme First**: Default is light theme. CSS variables in [src/config/themeColors.css](src/config/themeColors.css) map to [tailwind.config.ts](tailwind.config.ts).
- **Rule**: NEVER use raw colors or Tailwind named classes (e.g., `text-red-500`, `#ff0000`, `rgba(...)`) in `className` within component files (enforced by `yarn check:colors`). Use semantic utility classes (e.g., `text-error`, `bg-surface`) or `var(--token)`.

### 3. API & Query Patterns
- **API Naming**: GET endpoints use `get*` prefix (e.g., `getOverviewSummary`). `fetch*` is reserved ONLY for the browser's Fetch API.
- **TanStack Query**: Use the shared custom hook `useStandardQuery` instead of raw `useQuery` for default behaviors.
- **Loading State**: Check loading via `isPending && data === undefined`. Always set `placeholderData: keepPreviousData`.
- **Query Keys**: Dashboard queries use stable keys (no `refreshKey`). Explorer queries include `refreshKey` in `queryKey`.

### 4. Router & Navigation
- **Router Casts**: Never use `as any` for router redirects or navigation casts. Use `dynamicNavigateOptions(to, search?)` and `dynamicTo(path)` from `@shared/utils/navigation`.

---

## Directory Reference
- Core App & Routing: `src/app/` (routes configured in `src/app/routes/router.tsx`)
- Product Features: `src/features/` (domain definitions, pages, state)
- Reusable Shared Layer: `src/shared/` (primitives, shared charts, API clients, helpers)

For more detailed information, see [AGENTS.md](AGENTS.md) (rules & principles) and [CODEBASE_INDEX.md](CODEBASE_INDEX.md) (features & file structure).
