import type { ExplorerFacetBucket } from "../../types/queries";

export interface FacetGroupModel {
  readonly field: string;
  readonly label: string;
  readonly buckets: readonly ExplorerFacetBucket[];
}
