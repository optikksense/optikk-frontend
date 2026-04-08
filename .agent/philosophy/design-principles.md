# Design Principles: Frontend

## Datadog-Style UI/UX

Optikk's design philosophy is modeled after Datadog: high-density, rich dashboards that are both comprehensive and actionable.

## Rules for Agents

### 1. Consistent Density
- **Principle**: Minimize whitespace; maximize information density.
- **Rule**: Use standard Radix/Tailwind components with consistent spacing (e.g., `var(--space-sm/md/lg)`).

### 2. High-Density Tables
- **Principle**: Explorer results tables (Logs, Traces) should feel professional and data-dense.
- **Rule**: Use horizontal scrolling and column pinning for tables with many fields.

### 3. Actionable Context
- **Principle**: Every data point should be a potential lead.
- **Rule**: Links (to trace IDs, log IDs) should be correctly formatted and redirect to the specific detail drawer or page via TanStack Router.

### 4. Modular Dashboard Panels
- **Principle**: Backend-driven panels must be reusable.
- **Rule**: Register all new renderers in `dashboardPanelRegistry.tsx`.
- **Rule**: Shared chart primitives (UPlotChart, ObservabilityChart) should be preferred over bespoke charting code.

### 5. Drawer-First Details
- **Principle**: Always use Drawers (via `DashboardEntityDrawer`) for details before navigating to a new page, keeping the user in their context.
