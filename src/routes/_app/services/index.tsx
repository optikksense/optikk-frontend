import { createFileRoute } from "@tanstack/react-router";

import { type TimeRangeSearch, pickTimeRangeSearch } from "@shared/hooks/useTimeRangeURL";
import { asSearchString } from "@shared/search/utils/urlState";

/** Service hub state: `tab` selects catalog/map, `status` filters the catalog. */
export type ServiceHubSearch = TimeRangeSearch & {
  tab?: string;
  status?: string;
};

export const Route = createFileRoute("/_app/services/")({
  validateSearch: (search: Record<string, unknown>): ServiceHubSearch => ({
    ...pickTimeRangeSearch(search),
    tab: asSearchString(search.tab),
    status: asSearchString(search.status),
  }),
});
