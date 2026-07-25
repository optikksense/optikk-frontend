import type { TopEndpoint } from "@shared/api/red/redApi";

/**
 * Protocol verb for an endpoint row.
 *
 * The verb comes from the dedicated span_stats columns, never from parsing
 * span_name — instrumentation only puts the method in the span name when it
 * knew the route, so parsing mislabels every route-less HTTP span. Returns
 * null when the span carries no protocol verb at all (INTERNAL work), which
 * callers should render as "unknown" rather than guessing.
 */
export function endpointMethod(row: Pick<TopEndpoint, "httpMethod" | "rpcSystem">): string | null {
  if (row.httpMethod) return row.httpMethod.toUpperCase();
  if (row.rpcSystem) return row.rpcSystem === "grpc" ? "gRPC" : row.rpcSystem.toUpperCase();
  return null;
}
