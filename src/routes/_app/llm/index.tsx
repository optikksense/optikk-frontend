import { createFileRoute } from "@tanstack/react-router";

import { type LlmTab, isLlmTab } from "@/features/llm/pages/LlmPage/llmTabs";

type LlmSearch = {
  tab?: LlmTab;
  // Global time-range params (owned by useTimeRangeURL) pass through so
  // in-route navigations preserve them.
  from?: string | number;
  to?: string | number;
  tz?: string;
};

function passthrough(value: unknown): string | number | undefined {
  return typeof value === "string" || typeof value === "number" ? value : undefined;
}

export const Route = createFileRoute("/_app/llm/")({
  validateSearch: (search: Record<string, unknown>): LlmSearch => ({
    tab: isLlmTab(search.tab) && search.tab !== "dashboard" ? search.tab : undefined,
    from: passthrough(search.from),
    to: passthrough(search.to),
    tz: typeof search.tz === "string" ? search.tz : undefined,
  }),
});
