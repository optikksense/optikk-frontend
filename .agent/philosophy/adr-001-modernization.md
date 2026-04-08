# ADR-001: Frontend Modernization

## Status
Accepted (Migrated April 2026)

## Context
The `optic-frontend` was previously running on React 18 and a legacy routing system (`react-router-dom`). To improve performance (especially for high-density Datadog-style dashboards) and developer safety, we modernized the core stack.

## Decisions

### 1. React 19 & Ref Passing
- **Decision**: Remove all `forwardRef` usage in favor of the native `ref` prop.
- **Agent Rule**: Always pass `ref` directly to components; do not wrap with `forwardRef`.

### 2. Zustand 5 & Atomic Selectors
- **Decision**: Upgrade to Zustand 5 and enforce atomic selectors.
- **Rationale**: Prevents unnecessary re-renders in high-density data visualizations.
- **Agent Rule**: Always use granular selectors (e.g., `const teamId = useAppStore(s => s.selectedTeamId)` instead of `const { teamId } = useAppStore()`).

### 3. TanStack Router 1
- **Decision**: Replace `react-router-dom` with `TanStack Router` for type-safe routing.
- **Agent Rule**: 
  - All navigation must use the object syntax: `navigate({ to: path })`.
  - Use `strict: false` or `as any` for dynamic backend-driven routes when necessary to maintain flexibility.
  - Link components should use `activeProps` and `inactiveProps` instead of the legacy `className` callback function.

### 4. TanStack Query 5
- **Decision**: Utilize `placeholderData: keepPreviousData` and `refreshKey` for background refreshes.
- **Agent Rule**: Loading states should check `isPending && data === undefined` to distinguish between initial load and background update.

## Consequences
- **Positive**: Significantly reduced re-renders on dashboard updates; fully type-safe navigation; easier debuggability of route state.
- **Neutral**: Stricter requirement for defining routes before use (mostly mitigated via `strict: false` for dynamic backend routes).
