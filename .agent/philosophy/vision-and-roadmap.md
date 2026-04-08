# Vision & Roadmap: Frontend

## Core Mission
Optikk aims to be the **most efficient observability platform for developers**, providing a world-class experience similar to **Datadog**, with a specialized priority on **LLM Observability**.

## Strategic Pillars

### 1. LLM Observability First
- **Priority**: AI-native workflows (trace spans for model calls, token tracking, cost monitoring) are first-class citizens.
- **Agent Rule**: When adding features to Traces or Logs, always check if they can enhance LLM-specific data (e.g., span attributes for model name, prompt vs. completion tokens).

### 2. Datadog-Style Intelligence
- **Principle**: High information density without sacrificing discoverability. 
- **Agent Rule**: Use unified dashboard patterns (ConfigurableDashboard, DashboardPanelRegistry) to maintain a cohesive platform feel. Avoid bespoke UI for every page.

### 3. Developer Efficiency
- **Goal**: Minimize the "Time to Insight."
- **Agent Rule**: Prioritize "Opinionated Insights" (Vercel-style abstraction) when presenting data, but allow "Extreme Density" (Datadog-style) for deep dives.

### 4. Infrastructure Extensibility
- **Rule**: Code must be extensible at the infrastructure layer (e.g., swapping in-memory cache for Redis, internal channels for Kafka) without changing core business logic.
- **Agent Rule**: Always abstract infrastructure-specific code behind clean interfaces or hooks.
