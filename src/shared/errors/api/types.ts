import type { ErrorGroup } from "@shared/api/errors";
import type { ExplorerFacetBucket } from "@shared/search/types/queries";

/** POST /errors/groups/query — one page of grouped issues. */
export interface ErrorGroupsPage {
  readonly groups: readonly ErrorGroup[];
  readonly nextCursor?: string;
}

/** POST /errors/facets, keyed by DSL field name. */
export type ErrorsFacets = Readonly<Record<string, readonly ExplorerFacetBucket[]>>;

/** POST /errors/overview — KPI strip + error-volume chart in one round trip. */
export interface ErrorsOverview {
  readonly summary: {
    readonly totalErrors: number;
    readonly activeIssues: number;
    readonly newIssues: number;
    readonly servicesAffected: number;
  };
  readonly trend: readonly { readonly timeBucketMs: number; readonly errors: number }[];
}
