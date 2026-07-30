import { createFileRoute } from "@tanstack/react-router";

import { type LlmTab, isLlmTab } from "@/features/llm/pages/LlmPage/llmTabs";
import { type TimeRangeSearch, pickTimeRangeSearch } from "@shared/hooks/useTimeRangeURL";
import { type ExplorerUrlSearch, pickExplorerSearch } from "@shared/search/utils/urlState";

type LlmSearch = TimeRangeSearch & ExplorerUrlSearch & { tab?: LlmTab };

export const Route = createFileRoute("/_app/llm/")({
  validateSearch: (search: Record<string, unknown>): LlmSearch => ({
    ...pickTimeRangeSearch(search),
    ...pickExplorerSearch(search),
    tab: isLlmTab(search.tab) && search.tab !== "dashboard" ? search.tab : undefined,
  }),
});
