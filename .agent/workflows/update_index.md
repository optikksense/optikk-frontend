---
description: Maintain the CODEBASE_INDEX.md when architecture or routing changes in optic-frontend.
---

# Workflow: Update Codebase Index

You must run this workflow after adding new features, routes, or modifying the cross-repo API map.

1. **Scan the changes**: Identify new domains in `src/app/registry/domainRegistry.ts`, or new routes in `src/shared/constants/routes.ts`.
2. **Review [CODEBASE_INDEX.md](../../CODEBASE_INDEX.md)**: Find the relevant section (Feature folders, Shared layer, or Cross-repo map).
3. **Draft the Update**: Ensure the new entry follows the existing table format.
| Area | Path | Notes |
|------|------|--------|
4. **Apply Changes**: Update the file to maintain truth in documentation.
5. **Cross-Reference**: If the change involves the backend, ensure the **Frontend ↔ backend map** is updated in both repositories.
