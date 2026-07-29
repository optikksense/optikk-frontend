import { createFileRoute } from "@tanstack/react-router";

import { type LlmTab, isLlmTab } from "@/features/llm/pages/LlmPage/llmTabs";
import { type TimeRangeSearch, pickTimeRangeSearch } from "@shared/hooks/useTimeRangeURL";

type LlmSearch = TimeRangeSearch & { tab?: LlmTab };

export const Route = createFileRoute("/_app/llm/")({
  validateSearch: (search: Record<string, unknown>): LlmSearch => ({
    ...pickTimeRangeSearch(search),
    tab: isLlmTab(search.tab) && search.tab !== "dashboard" ? search.tab : undefined,
  }),
});
