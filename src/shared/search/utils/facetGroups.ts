import type { FacetGroupModel } from "../components/facets/FacetGroup";
import type { ExplorerFacetBucket } from "../types/queries";

const FIELD_LABELS: Readonly<Record<string, string>> = {
  service: "Service",
  operation: "Operation",
  httpMethod: "Method",
  httpStatus: "HTTP",
  status: "Status",
  exceptionType: "Exception",
};

function humanLabel(field: string): string {
  return FIELD_LABELS[field] ?? field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, " ");
}

/** Turns a `{field: buckets}` facet response into rail-ready groups. */
export function toFacetGroups(
  facets: Readonly<Record<string, readonly ExplorerFacetBucket[]>> | undefined
): FacetGroupModel[] {
  if (!facets) return [];
  return Object.entries(facets).map(([field, buckets]) => ({
    field,
    label: humanLabel(field),
    buckets: [...buckets],
  }));
}
