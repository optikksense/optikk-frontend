import { createFileRoute } from "@tanstack/react-router";

import { type TimeRangeSearch, pickTimeRangeSearch } from "@shared/hooks/useTimeRangeURL";
import { asSearchString } from "@shared/search/utils/urlState";

/** Settings state: `tab` selects profile/tenant/instrumentation/ingestion/members. */
export type SettingsSearch = TimeRangeSearch & { tab?: string };

export const Route = createFileRoute("/_app/settings")({
  validateSearch: (search: Record<string, unknown>): SettingsSearch => ({
    ...pickTimeRangeSearch(search),
    tab: asSearchString(search.tab),
  }),
});
