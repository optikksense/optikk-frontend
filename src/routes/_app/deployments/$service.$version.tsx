import { createFileRoute } from "@tanstack/react-router";

import { type TimeRangeSearch, pickTimeRangeSearch } from "@shared/hooks/useTimeRangeURL";
export type DeploymentDetailSearch = TimeRangeSearch & {
  env?: string;
};

export const Route = createFileRoute("/_app/deployments/$service/$version")({
  validateSearch: (search: Record<string, unknown>): DeploymentDetailSearch => ({
    ...pickTimeRangeSearch(search),
    env: typeof search.env === "string" ? search.env : undefined,
  }),
});
