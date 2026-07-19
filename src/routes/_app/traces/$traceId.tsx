import { createFileRoute } from "@tanstack/react-router";

type TraceDetailSearch = {
  q?: string;
  err?: boolean;
  span?: string;
};

export const Route = createFileRoute("/_app/traces/$traceId")({
  validateSearch: (search: Record<string, unknown>): TraceDetailSearch => ({
    q: typeof search.q === "string" ? search.q : undefined,
    err: search.err === true || search.err === "true",
    span: typeof search.span === "string" ? search.span : undefined,
  }),
});
