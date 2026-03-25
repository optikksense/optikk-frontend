# AGENTS.md

## Scope

- Applies to the entire repository rooted here.

## Project Summary

- React 18 + Vite single-page application for the Optikk observability frontend.
- TypeScript is the default language for app code.
- Styling uses Tailwind CSS and shared UI primitives.

## Working Agreements

- Keep changes small, focused, and consistent with existing patterns.
- Prefer fixing root causes over adding one-off workarounds.
- Do not modify generated or install output unless the task explicitly requires it.
- Preserve existing public routes, API contracts, and user-visible behavior unless asked to change them.

## Source Layout

- `src/app`: app shell, routing, and app-level composition.
- `src/pages`: top-level pages.
- `src/features`: feature modules and domain-specific UI.
- `src/shared`: reusable components, hooks, API clients, and utilities.
- `src/store`: Zustand state.
- `src/config`: runtime and application configuration.
- `docs`: project documentation.
- `scripts`: lightweight repository scripts.

## Code Style

- Prefer TypeScript `type`/`interface` definitions that are explicit and narrow.
- Reuse existing shared utilities and components before creating new abstractions.
- Keep React components focused; extract helpers when logic becomes difficult to scan.
- Follow existing naming conventions and file placement near similar code.
- Avoid adding new dependencies unless they are clearly justified.
- Do not use one-letter variable names except for well-known local iterators.

## Validation

- Use the smallest relevant check first, then broader validation if needed.
- Common commands:
  - `npm run type-check`
  - `npm run lint`
  - `npm run test`
  - `npm run build`
  - `npm run ci`

## Local Development Notes

- Use `npm run dev` for local development.
- Local frontend development expects a backend at `http://localhost:9090` unless overridden by environment variables.
- Keep `.gitignore` updated if a task introduces new generated files or local artifacts.

## Agent Guidance

- Before making broad structural changes, inspect adjacent files for established patterns.
- When editing large files, change only the relevant area and avoid incidental refactors.
- Update docs when behavior, setup, or developer workflows change.
