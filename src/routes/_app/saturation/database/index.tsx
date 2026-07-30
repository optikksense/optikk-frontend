import { createFileRoute, redirect } from "@tanstack/react-router";

import { ROUTES } from "@/shared/constants/routes";
import { type TimeRangeSearch, pickTimeRangeSearch } from "@shared/hooks/useTimeRangeURL";
import { type ExplorerUrlSearch, pickExplorerSearch } from "@shared/search/utils/urlState";

type LegacyDatabaseSearch = ExplorerUrlSearch & TimeRangeSearch;

export const Route = createFileRoute("/_app/saturation/database/")({
  validateSearch: (search: Record<string, unknown>): LegacyDatabaseSearch => ({
    ...pickExplorerSearch(search),
    ...pickTimeRangeSearch(search),
  }),
  beforeLoad: ({ search }) => {
    throw redirect({ to: ROUTES.database, search });
  },
});
