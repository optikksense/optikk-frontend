# CLAUDE.md

**CRITICAL RULE**: You MUST refer to and update `CODE_INDEX.md` after every architectural or structural task to ensure the codebase index remains accurate.

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

---

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

---

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself:

> Would a senior engineer say this is overcomplicated?

If yes, simplify.

---

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

The test:

> Every changed line should trace directly to the user's request.

---

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```text
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently.

Weak criteria ("make it work") require constant clarification.

---

## 5. Engineering Principles

- No God files, God components, God hooks, God functions or God services.
- Every module should have a single responsibility.
- DRY: Single authoritative representation for each piece of knowledge.
- SRP: One reason to change.
- OCP: Open for extension, closed for modification.
- LSP: Subtypes must remain substitutable.
- ISP: Prefer many focused interfaces.
- DIP: Depend on abstractions instead of implementations.

---

## 6. Code Comments

- Prefer self-documenting code over comments.
- Comments should explain *why*, not *what*.
- Keep comments under 80 characters whenever practical.
- Remove outdated comments during implementation.

---

## 7. Architecture First

Always optimize for long-term maintainability instead of short-term convenience.

Before introducing new code, evaluate whether it:

- fits the existing architecture
- respects feature boundaries
- increases coupling
- introduces unnecessary dependencies
- creates future maintenance cost

Challenge existing designs instead of assuming they are correct.

If a simpler architecture exists, recommend it.

---

## 8. Scalability Mindset

Write code that can comfortably evolve as the project grows.

Assume the project may eventually contain:

- dozens of product features
- hundreds of React components
- many developers working simultaneously
- enterprise functionality
- large datasets
- high-frequency updates

Avoid designs that scale poorly.

---

## 9. Feature Ownership

Each feature should own its:

- UI
- business logic
- API layer
- hooks
- models
- utilities
- tests

Shared modules should only contain code that is genuinely reusable across multiple domains.

Avoid dumping unrelated utilities into shared folders.

---

## 10. React & TypeScript Best Practices

Prefer modern React patterns.

- Keep components focused and small.
- Minimize unnecessary re-renders.
- Keep state as local as possible.
- Avoid prop drilling where architecture provides better alternatives.
- Use TanStack Query for server state.
- Use Zustand only for true client-side shared state.
- Prefer strict TypeScript over `any`.
- Eliminate unnecessary casts whenever possible.

---

## 11. Technical Debt Awareness

Always identify opportunities to reduce future maintenance cost.

Flag:

- duplicated logic
- oversized files
- oversized components
- weak typing
- circular dependencies
- dead code
- unstable APIs
- hidden coupling
- unnecessary abstractions
- poor naming
- excessive complexity

Do not silently ignore technical debt.

Mention it even if it is outside the requested scope.

---

## 12. Code Review Standard

Review your own implementation before considering it complete.

Ask yourself:

- Is this the simplest correct solution?
- Would this still look good in two years?
- Would another senior engineer immediately understand it?
- Is the architecture improved or degraded?
- Does this introduce unnecessary complexity?
- Is every abstraction justified?
- Can this scale as the product grows?

Only deliver code that you would confidently approve during a production code review.

---

**These guidelines are working if:**

- Diffs stay small and intentional.
- Simplicity wins over cleverness.
- Architecture improves over time.
- Technical debt decreases instead of accumulates.
- Code remains understandable years later.
- Clarifying questions happen before implementation instead of after mistakes.