# Highest Engineering Standards: Agent Rulebook

This document defines the **Staff-level** engineering standards for AI agents working on Optikk-Frontend. These rules are mandatory and prioritized over generic coding patterns.

## Core Directives

### 1. No Python Modification Scripts
- **Rule**: NEVER create or run Python scripts to perform bulk code changes, refactors, or migrations.
- **Rationale**: Agents must use their native code-editing tools (e.g., `multi_replace_file_content`) to ensure traceability, precision, and adherence to linting standards in real-time.

### 2. Conventional Commits & Summaries
- **Rule**: All task summaries and commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.
- **Prefixes**: 
    - `feat:` (New feature)
    - `fix:` (Bug fix)
    - `refactor:` (Code change that neither fixes a bug nor adds a feature)
    - `docs:` (Documentation only changes)
    - `chore:` (Maintenance tasks)

### 3. Direct Imports Only (No Barrels)
- **Rule**: NEVER use barrel imports (e.g., `import { Button } from "@/shared/components/ui"`) when importing from internal components or libraries.
- **Action**: Always import directly from the source file (e.g., `import { Button } from "@/shared/components/ui/button"`).
- **Rationale**: This minimizes bundle size, prevents circular dependencies, and improves tree-shaking efficiency (Datadog-standard).

### 4. Strict Type Imports
- **Rule**: Always use the `import type` syntax when importing internal TypeScript types or interfaces.
- **Example**: `import type { User } from "@/shared/entities/user";`

### 5. Early Returns & Complexity Control
- **Rule**: Use early returns to minimize nesting depth.
- **Rule**: Functions should rarely exceed 100 lines. If they do, refactor into sub-functions or hooks.

### 6. Explain "Why", Not "What"
- **Rule**: Code comments should only exist to explain **why** a non-obvious decision was made, not **what** the code is doing.
- **Rationale**: Clean, self-documenting code with descriptive naming is prioritized over inline comments.

### 7. Small, Atomic Diffs
- **Rule**: Keep changes focused and reviewable. 
- **Target**: Diffs should ideally be under 500 lines or 10 files per logical task. Split complex migrations into sequential atomic steps.

## Toolchain
- **Formater/Linter**: [Biome](https://biomejs.dev/)
- **Command**: `npm run lint:fix` or `npm run format`
