import { createFileRoute } from "@tanstack/react-router";

import { type TimeRangeSearch, pickTimeRangeSearch } from "@shared/hooks/useTimeRangeURL";
import { asSearchString } from "@shared/search/utils/urlState";

export type DeploymentsSearch = TimeRangeSearch & {
  tab?: string;
  env?: string;
  q?: string;
  sort?: string;
};

export const Route = createFileRoute("/_app/deployments/")({
  validateSearch: (search: Record<string, unknown>): DeploymentsSearch => ({
    ...pickTimeRangeSearch(search),
    tab: asSearchString(search.tab),
    env: typeof search.env === "string" ? search.env : undefined,
    q: asSearchString(search.q),
    sort: asSearchString(search.sort),
  }),
});
