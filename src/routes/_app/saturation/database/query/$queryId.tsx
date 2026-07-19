import { createFileRoute } from "@tanstack/react-router";

type DatabaseQuerySearch = {
  dbSystem?: string;
  collection?: string;
  namespace?: string;
  server?: string;
};

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value !== "" ? value : undefined;
}

export const Route = createFileRoute("/_app/saturation/database/query/$queryId")({
  validateSearch: (search: Record<string, unknown>): DatabaseQuerySearch => ({
    dbSystem: optionalString(search.dbSystem),
    collection: optionalString(search.collection),
    namespace: optionalString(search.namespace),
    server: optionalString(search.server),
  }),
});
